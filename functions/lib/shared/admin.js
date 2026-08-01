import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
export function getAdminFirestore() { const projectId = process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || (process.env.FIRESTORE_EMULATOR_HOST ? 'abp-emulator' : undefined); if (!projectId)
    throw new Error('GCLOUD_PROJECT or FIREBASE_PROJECT_ID is required outside the Firebase emulator.'); if (!getApps().length)
    initializeApp(process.env.FIRESTORE_EMULATOR_HOST ? { projectId } : { credential: applicationDefault(), projectId }); return getFirestore(); }
