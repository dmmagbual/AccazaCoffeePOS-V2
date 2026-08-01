import assert from 'node:assert/strict'
import test from 'node:test'
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore'
import { getAuth } from 'firebase-admin/auth'
import { getAdminFirestore } from '../lib/shared/admin.js'
import { cleanupClient, signInAsFranchiseUser, signInAsHeadOfficeUser, signInAsOtherOrgUser } from './fixtures/clientSignIn.mjs'
import { removeAuthFixtures } from './fixtures/authUsers.mjs'
import { cleanupScopedReadRecords, scopedReadFixtureIds, seedScopedReadRecords } from './fixtures/scopedReadRecords.mjs'

const denied = (operation) => assert.rejects(operation, (error) => error?.code === 'permission-denied')

test('cross-organization, franchise, and Head Office client read scopes remain isolated', { skip: !process.env.FIRESTORE_EMULATOR_HOST }, async () => {
  const db = getAdminFirestore()
  const auth = getAuth()
  const ids = await seedScopedReadRecords(db)
  const otherOrganization = await signInAsOtherOrgUser(auth, ids.otherOrganizationId, 'read-other-org-branch')
  const franchise = await signInAsFranchiseUser(auth, 'read-other-franchise-org', 'read-other-franchise-branch')
  const headOffice = await signInAsHeadOfficeUser(auth, ids.ownerOrganizationId)

  try {
    for (const [collectionName, id] of [
      ['cashierSaleSummaries', 'read-summary-owner'], ['receipts', 'read-receipt-owner'], ['journalEntries', 'read-journal-owner'],
      ['financePostingRequests', 'read-finance-owner'], ['loyaltyBalances', 'read-loyalty-owner'], ['auditLogs', 'read-audit-owner'],
    ]) await denied(() => getDoc(doc(otherOrganization.firestore, collectionName, id)))
    await denied(() => getDocs(query(collection(otherOrganization.firestore, 'cashierSaleSummaries'), where('organizationId', '==', ids.ownerOrganizationId))))
    await denied(() => getDocs(query(collection(otherOrganization.firestore, 'receipts'), where('organizationId', '==', ids.ownerOrganizationId))))

    for (const [collectionName, id] of [
      ['cashierSaleSummaries', 'read-summary-franchise'], ['receipts', 'read-receipt-franchise'], ['journalEntries', 'read-journal-franchise'],
      ['loyaltyBalances', 'read-loyalty-franchise'], ['auditLogs', 'read-audit-franchise'],
    ]) await denied(() => getDoc(doc(franchise.firestore, collectionName, id)))
    await denied(() => getDocs(query(collection(franchise.firestore, 'cashierSaleSummaries'), where('organizationId', '==', ids.franchiseOrganizationId))))
    await denied(() => getDocs(query(collection(franchise.firestore, 'receipts'), where('organizationId', '==', ids.franchiseOrganizationId))))

    assert.equal((await getDoc(doc(headOffice.firestore, 'cashierSaleSummaries', 'read-summary-owner'))).data()?.organizationId, ids.ownerOrganizationId)
    await denied(() => getDoc(doc(headOffice.firestore, 'cashierSaleSummaries', 'read-summary-franchise')))
    await denied(() => getDoc(doc(headOffice.firestore, 'receipts', 'read-receipt-franchise')))
  } finally {
    await Promise.all([cleanupClient(otherOrganization), cleanupClient(franchise), cleanupClient(headOffice)])
    await cleanupScopedReadRecords(db)
    await removeAuthFixtures(auth)
  }
})
