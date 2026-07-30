import { getFirestore, type Firestore } from 'firebase/firestore'
import { firebaseApp } from './config'
export const firestore: Firestore | null = firebaseApp ? getFirestore(firebaseApp) : null
