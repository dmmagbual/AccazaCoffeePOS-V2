import assert from 'node:assert/strict'
import test from 'node:test'
import { seedTrustedShiftValidationFixture } from './fixtures/trustedSaleFixture.mjs'

const stages = ['afterIdempotencyClaim', 'afterSaleDocument', 'afterReceiptCreation', 'afterPaymentPersistence', 'afterFifoAllocation', 'afterSaleConsumptionCreation', 'afterInventoryBalanceMutation', 'afterCogsPersistence', 'afterJournalCreation', 'afterLoyaltyPersistence', 'afterShiftTotals', 'afterAuditCreation', 'afterOutboxPersistence', 'beforeCommit']
const guarded = ['orders', 'receipts', 'payments', 'stockMovements', 'inventoryBalances', 'journalEntries', 'loyaltyTransactions', 'shiftTotals', 'auditLogs', 'outboxEvents', 'cashierSaleSummaries', 'appliedShiftSales']
const endpoint = () => `http://127.0.0.1:5001/${process.env.GCLOUD_PROJECT ?? 'demo-no-project'}/asia-southeast1/completeSale`

async function signIn(auth, fixture, testFailurePoint) {
  const custom = await auth.createCustomToken(fixture.cashierId, { organizationId: fixture.organizationId, branchId: fixture.branchId, employeeId: fixture.cashierId, permissions: ['sales.complete'], ...(testFailurePoint ? { testFailurePoint } : {}) })
  const response = await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=emulator', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token: custom, returnSecureToken: true }) })
  const body = await response.json()
  assert.equal(response.status, 200, JSON.stringify(body))
  return body.idToken
}

async function invoke(token, fixture, idempotencyKey) {
  const response = await fetch(endpoint(), { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` }, body: JSON.stringify({ data: { idempotencyKey, requestedBranchId: fixture.branchId, shiftId: fixture.openShiftId, cartLines: [{ clientLineId: idempotencyKey, productId: fixture.productId, quantity: 1 }], payments: [{ paymentMethodId: fixture.paymentMethodId, amount: 110, currencyCode: 'PHP' }], customerId: `${fixture.organizationId}-customer` } }) })
  return { response, body: await response.json() }
}

async function effectCounts(db) { return Object.fromEntries(await Promise.all(guarded.map(async (collection) => [collection, (await db.collection(collection).get()).size]))) }

async function seedSupportingEvidence(db, fixture) {
  const account = (id, code, accountType) => db.collection('chartAccounts').doc(`${fixture.organizationId}-${id}`).set({ organizationId: fixture.organizationId, branchId: null, code, name: code, accountType, active: true, systemAccount: true, allowManualPosting: true })
  await Promise.all([
    account('cash', 'CASH', 'ASSET'), account('revenue', 'REVENUE', 'REVENUE'), account('tax', 'TAX', 'LIABILITY'), account('cogs', 'COGS', 'EXPENSE'), account('inventory', 'INVENTORY', 'ASSET'),
    db.collection('customers').doc(`${fixture.organizationId}-customer`).set({ organizationId: fixture.organizationId, active: true, displayName: 'Rollback customer' }),
    db.collection('loyaltyPrograms').doc(`${fixture.organizationId}-program`).set({ organizationId: fixture.organizationId, active: true, earnRate: 1 }),
    db.collection('accountingPeriods').doc(`${fixture.organizationId}-period`).set({ organizationId: fixture.organizationId, startDate: new Date('2025-01-01'), endDate: new Date('2030-01-01'), status: 'OPEN' }),
    db.collection('financePostingConfigurations').doc(`${fixture.organizationId}-finance`).set({ organizationId: fixture.organizationId, enabled: true, cogsPostingEnabled: true, paymentAccountIds: { [fixture.paymentMethodId]: `${fixture.organizationId}-cash` }, revenueAccountId: `${fixture.organizationId}-revenue`, taxPayableAccountId: `${fixture.organizationId}-tax`, costOfSalesAccountId: `${fixture.organizationId}-cogs`, inventoryAccountId: `${fixture.organizationId}-inventory` }),
    db.collection('paymentMethods').doc(fixture.paymentMethodId).set({ financialAccountId: `${fixture.organizationId}-cash` }, { merge: true })
  ])
}

async function cleanup(db, auth, fixture) {
  await db.collection('recipes').doc(fixture.recipeId).collection('versions').doc('v1').delete().catch(() => undefined)
  const collections = ['organizations', 'branches', 'employees', 'employeeBranchAssignments', 'shifts', 'productCategories', 'products', 'recipes', 'taxProfiles', 'taxConfigurationVersions', 'paymentMethods', 'ingredients', 'inventoryBatches', 'inventoryBalances', 'orders', 'receipts', 'payments', 'stockMovements', 'journalEntries', 'journalLines', 'loyaltyTransactions', 'loyaltyBalances', 'loyaltyPrograms', 'customers', 'shiftTotals', 'appliedShiftSales', 'auditLogs', 'outboxEvents', 'saleIdempotency', 'saleCounters', 'chartAccounts', 'accountingPeriods', 'financePostingConfigurations', 'cashierSaleSummaries', 'loyaltyPostingRequests']
  for (const collection of collections) { const snapshot = await db.collection(collection).get(); await Promise.all(snapshot.docs.filter((entry) => entry.data().organizationId === fixture.organizationId || entry.id.includes(fixture.organizationId) || entry.id.includes(fixture.branchId)).map((entry) => entry.ref.delete())) }
  await auth.deleteUser(fixture.cashierId).catch(() => undefined)
}

test('completeSale transaction failures roll back every trusted effect and allow one clean retry', { skip: !process.env.FIRESTORE_EMULATOR_HOST }, async () => {
  const { getAdminFirestore } = await import('../lib/shared/admin.js')
  const { getAuth } = await import('firebase-admin/auth')
  const db = getAdminFirestore(); const auth = getAuth()
  for (const stage of stages) {
    const fixture = await seedTrustedShiftValidationFixture(db, auth, { prefix: `rollback-${stage}` })
    const idempotencyKey = `rollback-${stage}`
    try {
      await seedSupportingEvidence(db, fixture)
      const before = await effectCounts(db)
      const failingToken = await signIn(auth, fixture, stage)
      const failure = await invoke(failingToken, fixture, idempotencyKey)
      assert.equal(failure.response.status, 500, `${stage}: ${JSON.stringify(failure.body)}`)
      assert.ok(failure.body.error?.details?.correlationId, `${stage} must return a correlation ID`)
      assert.equal(JSON.stringify(failure.body).includes('stack'), false)
      assert.equal(JSON.stringify(failure.body).includes('projects/'), false)
      assert.deepEqual(await effectCounts(db), before, `${stage} left trusted effects after rollback`)
      assert.equal((await db.collection('saleIdempotency').doc(`${fixture.organizationId}_${idempotencyKey}`).get()).exists, false, `${stage} left an orphan claim`)
      const retryToken = await signIn(auth, fixture)
      const retry = await invoke(retryToken, fixture, idempotencyKey)
      assert.equal(retry.response.status, 200, `${stage} retry: ${JSON.stringify(retry.body)}`)
      const saleId = retry.body.result.saleId
      assert.equal((await db.collection('saleIdempotency').doc(`${fixture.organizationId}_${idempotencyKey}`).get()).data()?.status, 'COMPLETED')
      assert.equal((await db.collection('orders').doc(saleId).get()).data()?.status, 'COMPLETED')
      assert.equal((await db.collection('receipts').doc(saleId).get()).exists, true)
      assert.equal((await db.collection('payments').where('saleId', '==', saleId).get()).size, 1)
      assert.equal((await db.collection('stockMovements').where('saleId', '==', saleId).get()).size, 1)
      assert.equal((await db.collection('cashierSaleSummaries').where('saleId', '==', saleId).get()).size, 1)
      const duplicate = await invoke(retryToken, fixture, idempotencyKey)
      assert.equal(duplicate.response.status, 200)
      assert.equal(duplicate.body.result.saleId, saleId)
      assert.equal((await db.collection('orders').where('organizationId', '==', fixture.organizationId).get()).size, 1)
    } finally { await cleanup(db, auth, fixture) }
  }
})

test('completeSale safely reclaims a stale claimed idempotency record', { skip: !process.env.FIRESTORE_EMULATOR_HOST }, async () => {
  const { getAdminFirestore } = await import('../lib/shared/admin.js')
  const { getAuth } = await import('firebase-admin/auth')
  const db = getAdminFirestore(); const auth = getAuth(); const fixture = await seedTrustedShiftValidationFixture(db, auth, { prefix: 'rollback-stale-claim' }); const idempotencyKey = 'rollback-stale-claim'
  try {
    await seedSupportingEvidence(db, fixture)
    const staleHash = JSON.stringify({ branchId: fixture.branchId, shiftId: fixture.openShiftId, cartLines: [{ clientLineId: idempotencyKey, productId: fixture.productId, quantity: 1 }], payments: [{ paymentMethodId: fixture.paymentMethodId, amount: 110, currencyCode: 'PHP' }], customerId: `${fixture.organizationId}-customer`, notes: null })
    await db.collection('saleIdempotency').doc(`${fixture.organizationId}_${idempotencyKey}`).set({ organizationId: fixture.organizationId, requestHash: staleHash, status: 'CLAIMED', leaseExpiresAt: new Date('2000-01-01') })
    const token = await signIn(auth, fixture)
    const result = await invoke(token, fixture, idempotencyKey)
    assert.equal(result.response.status, 200, JSON.stringify(result.body))
    assert.equal((await db.collection('saleIdempotency').doc(`${fixture.organizationId}_${idempotencyKey}`).get()).data()?.status, 'COMPLETED')
    assert.equal((await db.collection('orders').where('organizationId', '==', fixture.organizationId).get()).size, 1)
  } finally { await cleanup(db, auth, fixture) }
})
