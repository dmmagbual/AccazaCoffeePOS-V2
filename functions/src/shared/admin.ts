import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
export function getAdminFirestore() { if (!getApps().length) initializeApp({ credential: applicationDefault(), projectId: process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID }); return getFirestore() }
