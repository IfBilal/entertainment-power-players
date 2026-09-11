import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { chunk, parseContactsCsv } from './csvImport';

initializeApp();

const BATCH_SIZE = 500;

type ImportContactsRequest = {
  csv: string;
};

/**
 * Callable Cloud Function: parses a contacts CSV (same shape as
 * docs/contacts-import-template.csv), validates it, and writes valid rows to
 * Firestore in batches of <=500 (handbook §5). Valid rows import even if
 * others fail. Requires the caller to hold the `admin` custom claim — mirrors
 * the Firestore rule so this function can't be used to bypass it.
 */
export const importContactsCsv = onCall<ImportContactsRequest>(async (request) => {
  if (request.auth?.token?.admin !== true) {
    throw new HttpsError('permission-denied', 'Only admins can import contacts.');
  }

  const { csv } = request.data;
  if (typeof csv !== 'string' || csv.trim().length === 0) {
    throw new HttpsError('invalid-argument', 'Expected a non-empty `csv` string.');
  }

  const db = getFirestore();
  const categoriesSnap = await db.collection('categories').get();
  const validCategorySlugs = new Set(categoriesSnap.docs.map((d) => d.id));

  const report = parseContactsCsv(csv, validCategorySlugs.size > 0 ? validCategorySlugs : undefined);

  for (const rowsBatch of chunk(report.imported, BATCH_SIZE)) {
    const batch = db.batch();
    for (const contact of rowsBatch) {
      const ref = db.collection('contacts').doc();
      batch.set(ref, { ...contact, categoryId: contact.categorySlug, updatedAt: new Date() });
    }
    await batch.commit();
  }

  return {
    imported: report.imported.length,
    skipped: report.skipped,
    unmappedColumns: report.unmappedColumns,
  };
});
