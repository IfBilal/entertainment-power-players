// Edge Function: deletes the calling user's own account.
//
// A client can never delete its own `auth.users` row -- that needs the
// service role. This function verifies the caller's JWT first, resolves the
// user id from that token (never from the request body, so a caller can only
// ever delete themselves), then deletes with the service role. Every
// per-user table (`profiles`, `profile_entitlements`, `favorites`,
// `challenge_progress`, `activity`, `goals`) has `on delete cascade` on its
// FK to auth.users, so their rows go with it.
//
// Mirrors handbook §4.7: "Delete account removes the user document and all
// subcollections through a Cloud Function, then signs out."
import { createClient } from 'npm:@supabase/supabase-js@2';

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

  // Resolve who is calling from their own JWT. This is the only source of the
  // user id -- there is deliberately no body parameter for it.
  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userError } = await callerClient.auth.getUser();
  if (userError || !userData.user) {
    return new Response(JSON.stringify({ error: 'Invalid session' }), { status: 401 });
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  const { error: deleteError } = await adminClient.auth.admin.deleteUser(userData.user.id);
  if (deleteError) {
    return new Response(JSON.stringify({ error: `Could not delete account: ${deleteError.message}` }), { status: 500 });
  }

  return new Response(JSON.stringify({ deleted: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
