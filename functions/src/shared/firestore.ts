import type { Firestore } from 'firebase-admin/firestore'
export async function runTransaction<T>(firestore: Firestore, work: Parameters<Firestore['runTransaction']>[0]): Promise<T> { return firestore.runTransaction(work) as Promise<T> }
export function normalizeTimestamp(value: { toDate(): Date } | Date): Date { return value instanceof Date ? value : value.toDate() }
export function serializeMoney(minor: number): number { if (!Number.isSafeInteger(minor)) throw new Error('Money must use safe minor units.'); return minor }
