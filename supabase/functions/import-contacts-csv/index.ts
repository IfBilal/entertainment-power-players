// Edge Function: parses a contacts CSV (same shape as
// docs/contacts-import-template.csv), validates it, and writes valid rows to
// Postgres in batches of <=500 (handbook §5). Valid rows import even if
// others fail. Requires the caller to be an admin (profile_entitlements.is_admin),
// mirroring the `contacts_admin_insert` RLS policy so this function can't be
// used to bypass it -- it uses the service role key to write, but checks the
// caller's own admin status first using their own JWT.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { chunk, parseContactsCsv } from './csvImport.ts';

const BATCH_SIZE = 500;

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Missing Authorization header' }), { status: 401 });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  // Check the caller's own admin status using their JWT (RLS-enforced read).
  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userError } = await callerClient.auth.getUser();
  if (userError || !userData.user) {
    return new Response(JSON.stringify({ error: 'Invalid session' }), { status: 401 });
  }

  const { data: entitlement } = await callerClient
    .from('profile_entitlements')
    .select('is_admin')
    .eq('user_id', userData.user.id)
    .maybeSingle();

  if (!entitlement?.is_admin) {
    return new Response(JSON.stringify({ error: 'Only admins can import contacts.' }), { status: 403 });
  }

  let body: { csv?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Expected a JSON body with a `csv` field.' }), { status: 400 });
  }

  if (typeof body.csv !== 'string' || body.csv.trim().length === 0) {
    return new Response(JSON.stringify({ error: 'Expected a non-empty `csv` string.' }), { status: 400 });
  }

  // Service-role client for the actual writes -- bypasses RLS, same trust
  // boundary the Firebase Admin SDK held in the earlier Firebase version.
  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  const { data: categories } = await adminClient.from('categories').select('slug');
  const validCategorySlugs = new Set((categories ?? []).map((c: { slug: string }) => c.slug));

  const report = parseContactsCsv(body.csv, validCategorySlugs.size > 0 ? validCategorySlugs : undefined);

  for (const rowsBatch of chunk(report.imported, BATCH_SIZE)) {
    const { error } = await adminClient.from('contacts').insert(
      rowsBatch.map((c) => ({
        name: c.name,
        name_lower: c.nameLower,
        sort_key: c.sortKey,
        category_slug: c.categorySlug,
        role: c.role,
        company: c.company,
        email: c.email,
        phone: c.phone,
        website: c.website,
        city: c.city,
        notes: c.notes,
        active: true,
      })),
    );
    if (error) {
      return new Response(JSON.stringify({ error: `Batch write failed: ${error.message}` }), { status: 500 });
    }
  }

  return new Response(
    JSON.stringify({
      imported: report.imported.length,
      skipped: report.skipped,
      unmappedColumns: report.unmappedColumns,
    }),
    { headers: { 'Content-Type': 'application/json' } },
  );
});
