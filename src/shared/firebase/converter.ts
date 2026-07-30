import type { DocumentData, FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions } from 'firebase/firestore'
export function documentConverter<T extends DocumentData>(): FirestoreDataConverter<T> { return { toFirestore: (value) => value, fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions) => snapshot.data(options) as T } }
