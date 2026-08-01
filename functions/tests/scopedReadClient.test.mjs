import assert from 'node:assert/strict'
import test from 'node:test'
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore'
import { getAuth } from 'firebase-admin/auth'
import { getAdminFirestore } from '../lib/shared/admin.js'
import { cleanupClient, signInAsCashier, signInAsOwner } from './fixtures/clientSignIn.mjs'
import { removeAuthFixtures } from './fixtures/authUsers.mjs'
import { cleanupScopedReadRecords, scopedReadFixtureIds, seedScopedReadRecords } from './fixtures/scopedReadRecords.mjs'

const denied = (operation) => assert.rejects(operation, (error) => error?.code === 'permission-denied')

test('owner and cashier client read scopes expose only the trusted sale read contract', { skip: !process.env.FIRESTORE_EMULATOR_HOST }, async () => {
  const db = getAdminFirestore()
  const auth = getAuth()
  const ids = await seedScopedReadRecords(db)
  const owner = await signInAsOwner(auth, ids.ownerOrganizationId, ids.ownerBranchId)
  const cashier = await signInAsCashier(auth, ids.ownerOrganizationId, ids.cashierBranchId, 'security-cashier')

  try {
    const ownerSummary = await getDoc(doc(owner.firestore, 'cashierSaleSummaries', 'read-summary-owner'))
    assert.equal(ownerSummary.data()?.organizationId, ids.ownerOrganizationId)
    const ownerSummaries = await getDocs(query(collection(owner.firestore, 'cashierSaleSummaries'), where('organizationId', '==', ids.ownerOrganizationId)))
    assert.equal(ownerSummaries.size, 3)
    assert.equal((await getDoc(doc(owner.firestore, 'receipts', 'read-receipt-owner'))).data()?.organizationId, ids.ownerOrganizationId)
    await denied(() => getDoc(doc(owner.firestore, 'cashierSaleSummaries', 'read-summary-other-org')))
    await denied(() => getDoc(doc(owner.firestore, 'receipts', 'read-receipt-other-org')))

    const cashierSummary = await getDoc(doc(cashier.firestore, 'cashierSaleSummaries', 'read-summary-cashier'))
    assert.equal(cashierSummary.data()?.shiftId, ids.cashierShiftId)
    const cashierShiftSummaries = await getDocs(query(collection(cashier.firestore, 'cashierSaleSummaries'), where('organizationId', '==', ids.ownerOrganizationId), where('branchId', '==', ids.cashierBranchId), where('shiftId', '==', ids.cashierShiftId)))
    assert.equal(cashierShiftSummaries.size, 1)
    assert.equal((await getDoc(doc(cashier.firestore, 'receipts', 'read-receipt-cashier'))).data()?.branchId, ids.cashierBranchId)
    await denied(() => getDoc(doc(cashier.firestore, 'cashierSaleSummaries', 'read-summary-other-branch')))
    await denied(() => getDoc(doc(cashier.firestore, 'journalEntries', 'read-journal-owner')))
    await denied(() => getDoc(doc(cashier.firestore, 'financePostingRequests', 'read-finance-owner')))
    await denied(() => getDoc(doc(cashier.firestore, 'stockMovements', 'read-cost-owner')))
    await denied(() => getDoc(doc(cashier.firestore, 'loyaltyBalances', 'read-loyalty-owner')))
    await denied(() => getDoc(doc(cashier.firestore, 'orders', 'read-sale-owner')))
  } finally {
    await Promise.all([cleanupClient(owner), cleanupClient(cashier)])
    await cleanupScopedReadRecords(db)
    await removeAuthFixtures(auth)
  }
})
