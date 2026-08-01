import assert from 'node:assert/strict'
import test from 'node:test'
import { signInAsCashier, cleanupClient } from './fixtures/clientSignIn.mjs'
import { authFixtureIds } from './fixtures/authUsers.mjs'
import { seedTrustedShiftValidationFixture } from './fixtures/trustedSaleFixture.mjs'

const callableUrl = () => `http://127.0.0.1:5001/${process.env.GCLOUD_PROJECT ?? 'demo-no-project'}/asia-southeast1/completeSale`

async function invoke(idToken, data) {
  const response = await fetch(callableUrl(), {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ data })
  })
  return { response, body: await response.json() }
}

async function count(query) { return (await query.get()).size }

async function cleanupSaleFixture(db, auth, fixture, saleId, idempotencyKey) {
  const explicit = [
    ['recipes', fixture.recipeId, 'versions/v1'],
    ['organizations', fixture.organizationId], ['branches', fixture.branchId], ['employees', fixture.cashierId],
    ['employeeBranchAssignments', `${fixture.cashierId}-${fixture.branchId}`], ['shifts', fixture.openShiftId], ['shifts', fixture.closedShiftId],
    ['productCategories', fixture.categoryId], ['products', fixture.productId], ['recipes', fixture.recipeId],
    ['taxProfiles', fixture.taxProfileId], ['taxConfigurationVersions', `${fixture.taxProfileId}-v1`], ['paymentMethods', fixture.paymentMethodId],
    ['ingredients', fixture.ingredientId], ['inventoryBatches', fixture.batchId], ['inventoryBalances', `${fixture.branchId}_${fixture.ingredientId}`],
    ['saleCounters', `${fixture.organizationId}_${fixture.branchId}`], ['saleIdempotency', `${fixture.organizationId}_${idempotencyKey}`],
    ['orders', saleId], ['receipts', saleId], ['cashierSaleSummaries', saleId], ['shiftTotals', fixture.openShiftId],
    ['appliedShiftSales', `${fixture.openShiftId}-${saleId}`], ['auditLogs', `SaleCompleted-${saleId}`], ['outboxEvents', `SaleCompleted-${saleId}`],
    ['journalEntries', `SALE-${saleId}`]
  ]
  await Promise.all(explicit.map(async ([collection, id, nested]) => {
    const reference = nested ? db.collection(collection).doc(id).collection(nested.split('/')[0]).doc(nested.split('/')[1]) : db.collection(collection).doc(id)
    await reference.delete().catch(() => undefined)
  }))
  for (const collection of ['payments', 'stockMovements', 'inventoryAllocations', 'loyaltyTransactions', 'journalLines', 'financePostingRequests', 'loyaltyPostingRequests']) {
    const snapshot = await db.collection(collection).get()
    await Promise.all(snapshot.docs.filter((entry) => entry.data().saleId === saleId || entry.id.includes(saleId)).map((entry) => entry.ref.delete()))
  }
  await auth.deleteUser(fixture.cashierId).catch(() => undefined)
}

test('completeSale retry reuses one committed sale and one cashier summary', { skip: !process.env.FIRESTORE_EMULATOR_HOST }, async () => {
  const { getAdminFirestore } = await import('../lib/shared/admin.js')
  const { getAuth } = await import('firebase-admin/auth')
  const db = getAdminFirestore()
  const adminAuth = getAuth()
  const fixture = await seedTrustedShiftValidationFixture(db, adminAuth, { prefix: 'duplicate-callable', cashierId: authFixtureIds.cashier })
  const cashier = await signInAsCashier(adminAuth, fixture.organizationId, fixture.branchId, fixture.cashierId)
  const idempotencyKey = 'duplicate-callable-key'
  const command = {
    idempotencyKey,
    requestedBranchId: fixture.branchId,
    shiftId: fixture.openShiftId,
    cartLines: [{ clientLineId: 'duplicate-line', productId: fixture.productId, quantity: 1 }],
    payments: [{ paymentMethodId: fixture.paymentMethodId, amount: 110, currencyCode: 'PHP' }]
  }
  let saleId = ''
  try {
    const first = await invoke(cashier.idToken.token, command)
    assert.equal(first.response.status, 200, JSON.stringify(first.body))
    assert.ok(first.body.result.saleId)
    assert.ok(first.body.result.receiptNumber)
    assert.ok(first.body.result.correlationId)
    saleId = first.body.result.saleId

    assert.equal((await db.collection('orders').doc(saleId).get()).data()?.status, 'COMPLETED')

    const summaryBefore = (await db.collection('cashierSaleSummaries').doc(saleId).get()).data()
    const receiptBefore = (await db.collection('receipts').doc(saleId).get()).data()
    const balanceBefore = (await db.collection('inventoryBalances').doc(`${fixture.branchId}_${fixture.ingredientId}`).get()).data()
    const shiftBefore = (await db.collection('shiftTotals').doc(fixture.openShiftId).get()).data()
    const countsBefore = {
      sales: await count(db.collection('orders').where('organizationId', '==', fixture.organizationId)),
      receipts: await count(db.collection('receipts').where('saleId', '==', saleId)),
      summaries: await count(db.collection('cashierSaleSummaries').where('saleId', '==', saleId)),
      payments: await count(db.collection('payments').where('saleId', '==', saleId)),
      movements: await count(db.collection('stockMovements').where('saleId', '==', saleId)),
      allocations: await count(db.collection('inventoryAllocations').where('saleId', '==', saleId)),
      loyalty: await count(db.collection('loyaltyTransactions').where('saleId', '==', saleId)),
      journals: (await db.collection('journalEntries').doc(`SALE-${saleId}`).get()).exists ? 1 : 0,
      audit: (await db.collection('auditLogs').doc(`SaleCompleted-${saleId}`).get()).exists ? 1 : 0,
      outbox: (await db.collection('outboxEvents').doc(`SaleCompleted-${saleId}`).get()).exists ? 1 : 0,
      idempotency: (await db.collection('saleIdempotency').doc(`${fixture.organizationId}_${idempotencyKey}`).get()).data()?.status
    }
    assert.equal(countsBefore.sales, 1)
    assert.equal(countsBefore.receipts, 1)
    assert.equal(countsBefore.summaries, 1)
    assert.equal(countsBefore.payments, 1)
    assert.equal(countsBefore.movements, 1)
    assert.equal(countsBefore.idempotency, 'COMPLETED')

    const retry = await invoke(cashier.idToken.token, command)
    assert.equal(retry.response.status, 200, JSON.stringify(retry.body))
    assert.equal(retry.body.result.saleId, saleId)
    assert.equal(retry.body.result.receiptNumber, first.body.result.receiptNumber)
    assert.deepEqual(retry.body.result, first.body.result)

    const countsAfter = {
      sales: await count(db.collection('orders').where('organizationId', '==', fixture.organizationId)),
      receipts: await count(db.collection('receipts').where('saleId', '==', saleId)),
      summaries: await count(db.collection('cashierSaleSummaries').where('saleId', '==', saleId)),
      payments: await count(db.collection('payments').where('saleId', '==', saleId)),
      movements: await count(db.collection('stockMovements').where('saleId', '==', saleId)),
      allocations: await count(db.collection('inventoryAllocations').where('saleId', '==', saleId)),
      loyalty: await count(db.collection('loyaltyTransactions').where('saleId', '==', saleId)),
      journals: (await db.collection('journalEntries').doc(`SALE-${saleId}`).get()).exists ? 1 : 0,
      audit: (await db.collection('auditLogs').doc(`SaleCompleted-${saleId}`).get()).exists ? 1 : 0,
      outbox: (await db.collection('outboxEvents').doc(`SaleCompleted-${saleId}`).get()).exists ? 1 : 0,
      idempotency: (await db.collection('saleIdempotency').doc(`${fixture.organizationId}_${idempotencyKey}`).get()).data()?.status
    }
    assert.deepEqual(countsAfter, countsBefore)
    assert.deepEqual((await db.collection('cashierSaleSummaries').doc(saleId).get()).data(), summaryBefore)
    assert.deepEqual((await db.collection('receipts').doc(saleId).get()).data(), receiptBefore)
    assert.deepEqual((await db.collection('inventoryBalances').doc(`${fixture.branchId}_${fixture.ingredientId}`).get()).data(), balanceBefore)
    assert.deepEqual((await db.collection('shiftTotals').doc(fixture.openShiftId).get()).data(), shiftBefore)

    const conflict = await invoke(cashier.idToken.token, { ...command, cartLines: [{ ...command.cartLines[0], quantity: 2 }] })
    assert.equal(conflict.response.status, 409, JSON.stringify(conflict.body))
    assert.equal(conflict.body.error.details.reasonCode, 'ALREADY_EXISTS')
    assert.ok(conflict.body.error.details.correlationId)
    assert.deepEqual({
      sales: await count(db.collection('orders').where('organizationId', '==', fixture.organizationId)),
      receipts: await count(db.collection('receipts').where('saleId', '==', saleId)),
      summaries: await count(db.collection('cashierSaleSummaries').where('saleId', '==', saleId)),
      payments: await count(db.collection('payments').where('saleId', '==', saleId)),
      movements: await count(db.collection('stockMovements').where('saleId', '==', saleId))
    }, { sales: 1, receipts: 1, summaries: 1, payments: 1, movements: 1 })
  } finally {
    await cleanupClient(cashier)
    await cleanupSaleFixture(db, adminAuth, fixture, saleId || 'SALE-2026-000001', idempotencyKey)
  }
})
