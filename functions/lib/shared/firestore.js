export async function runTransaction(firestore, work) { return firestore.runTransaction(work); }
export function normalizeTimestamp(value) { return value instanceof Date ? value : value.toDate(); }
export function serializeMoney(minor) { if (!Number.isSafeInteger(minor))
    throw new Error('Money must use safe minor units.'); return minor; }
