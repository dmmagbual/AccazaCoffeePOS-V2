import assert from 'node:assert/strict'
import test from 'node:test'
import { cleanupScopedReadRecords, scopedReadFixtureDocumentCount, scopedReadFixtureIds, seedScopedReadRecords } from './fixtures/scopedReadRecords.mjs'

test('scoped read-record fixture seeds deterministic records with the intended tenancy metadata', { skip: !process.env.FIRESTORE_EMULATOR_HOST }, async () => {
  const { getAdminFirestore } = await import('../lib/shared/admin.js')
  const db = getAdminFirestore()
  const ids = await seedScopedReadRecords(db)

  assert.deepEqual(ids, scopedReadFixtureIds)
  assert.equal((await db.collection('cashierSaleSummaries').doc('read-summary-owner').get()).data()?.organizationId, ids.ownerOrganizationId)
  assert.equal((await db.collection('cashierSaleSummaries').doc('read-summary-cashier').get()).data()?.shiftId, ids.cashierShiftId)
  assert.equal((await db.collection('cashierSaleSummaries').doc('read-summary-other-branch').get()).data()?.branchId, ids.otherBranchId)
  assert.equal((await db.collection('receipts').doc('read-receipt-other-org').get()).data()?.organizationId, ids.otherOrganizationId)
  assert.equal((await db.collection('cashierSaleSummaries').doc('read-summary-franchise').get()).data()?.franchiseOrganizationId, ids.franchiseOrganizationId)
  assert.equal((await db.collection('orders').doc('read-sale-owner').get()).data()?.confirmedCogs, 20)
  assert.equal((await db.collection('stockMovements').doc('read-cost-owner').get()).data()?.unitCost, 2)
  assert.equal((await db.collection('journalEntries').doc('read-journal-owner').get()).data()?.organizationId, ids.ownerOrganizationId)
  assert.equal((await db.collection('financePostingRequests').doc('read-finance-owner').get()).data()?.status, 'PENDING')
  assert.equal((await db.collection('loyaltyBalances').doc('read-loyalty-owner').get()).data()?.customerId, 'read-customer-owner')
  assert.equal((await db.collection('auditLogs').doc('read-audit-owner').get()).data()?.eventType, 'SaleCompleted')

  await cleanupScopedReadRecords(db)
  const probes = [
    ['cashierSaleSummaries', 'read-summary-owner'], ['receipts', 'read-receipt-owner'], ['orders', 'read-sale-owner'],
    ['journalEntries', 'read-journal-owner'], ['financePostingRequests', 'read-finance-owner'], ['stockMovements', 'read-cost-owner'],
    ['loyaltyBalances', 'read-loyalty-owner'], ['auditLogs', 'read-audit-owner'],
  ]
  assert.equal(scopedReadFixtureDocumentCount, 21)
  await Promise.all(probes.map(async ([collection, id]) => assert.equal((await db.collection(collection).doc(id).get()).exists, false)))
})
