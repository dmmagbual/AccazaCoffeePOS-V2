import { doc, setDoc, updateDoc, type DocumentData, type Firestore } from 'firebase/firestore'
import { COLLECTIONS } from '../../shared/config'
import type { ShiftRepository } from './contracts'
export function createFirestoreShiftRepository(firestore: Firestore): ShiftRepository { return { async save(shift) { await setDoc(doc(firestore, COLLECTIONS.shifts, shift.id), shift) }, async update(id, updates) { await updateDoc(doc(firestore, COLLECTIONS.shifts, id), updates as DocumentData) } } }
