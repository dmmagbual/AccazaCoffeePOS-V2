import { getStorage, type FirebaseStorage } from 'firebase/storage'
import { firebaseApp } from './config'
export const storage: FirebaseStorage | null = firebaseApp ? getStorage(firebaseApp) : null
