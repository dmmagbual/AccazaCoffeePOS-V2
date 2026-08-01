import { initializeApp, deleteApp } from 'firebase/app'
import { connectAuthEmulator, getAuth, signInWithCustomToken, signOut } from 'firebase/auth'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'
import { createOwner, createCashier, createOtherOrgUser, createFranchiseUser, createHeadOfficeUser } from './authUsers.mjs'

async function signIn(factory, adminAuth, ...args) { const identity = await factory(adminAuth, ...args); const app = initializeApp({ apiKey: 'emulator', projectId: process.env.GCLOUD_PROJECT ?? 'demo-no-project', appId: `client-${identity.uid}-${Date.now()}` }, `client-${identity.uid}-${Date.now()}`); const auth = getAuth(app); connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true }); const firestore = getFirestore(app); connectFirestoreEmulator(firestore, '127.0.0.1', 8080); const credential = await signInWithCustomToken(auth, identity.customToken); return { app, auth, firestore, user: credential.user, idToken: await credential.user.getIdTokenResult(), identity } }
export const signInAsOwner = (auth, organizationId, branchId) => signIn(createOwner, auth, organizationId, branchId)
export const signInAsCashier = (auth, organizationId, branchId, employeeId) => signIn(createCashier, auth, organizationId, branchId, employeeId)
export const signInAsOtherOrgUser = (auth, organizationId, branchId) => signIn(createOtherOrgUser, auth, organizationId, branchId)
export const signInAsFranchiseUser = (auth, organizationId, branchId) => signIn(createFranchiseUser, auth, organizationId, branchId)
export const signInAsHeadOfficeUser = (auth, organizationId) => signIn(createHeadOfficeUser, auth, organizationId)
export async function cleanupClient(context) { await signOut(context.auth); await deleteApp(context.app) }
