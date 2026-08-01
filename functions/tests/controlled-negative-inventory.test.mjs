import assert from 'node:assert/strict'
import test from 'node:test'
import { seedTrustedShiftValidationFixture } from './fixtures/trustedSaleFixture.mjs'

const endpoint = () => `http://127.0.0.1:5001/${process.env.GCLOUD_PROJECT ?? 'demo-no-project'}/asia-southeast1/completeSale`
const trustedEffectCollections = ['orders', 'receipts', 'payments', 'saleIdempotency', 'stockMovements', 'inventoryBalances', 'shiftTotals', 'journalEntries', 'loyaltyTransactions', 'auditLogs', 'outboxEvents', 'cashierSaleSummaries', 'appliedShiftSales']

async function signIn(auth, fixture) {
  const token = await auth.createCustomToken(fixture.cashierId, {
    organizationId: fixture.organizationId,
    branchId: fixture.branchId,
    employeeId: fixture.cashierId,
    permissions: ['sales.complete']
  })
  const response = await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=emulator', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ token, returnSecureToken: true })
  })
  const body = await response.json()
  assert.equal(response.status, 200, JSON.stringify(body))
  return body.idToken
}

async function invoke(token, fixture, idempotencyKey) {
  const response = await fetch(endpoint(), {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
    body: JSON.stringify({
      data: {
        idempotencyKey,
        requestedBranchId: fixture.branchId,
        shiftId: fixture.openShiftId,
        cartLines: [{ clientLineId: `${idempotencyKey}-line`, productId: fixture.productId, quantity: 1 }],
        payments: [{ paymentMethodId: fixture.paymentMethodId, amount: 110, currencyCode: 'PHP' }]
      }
    })
  })
  return { response, body: await response.json() }
}

async function counts(db, organizationId) {
  return Object.fromEntries(await Promise.all(trustedEffectCollections.map(async (collection) => [
    collection,
    (await db.collection(collection).where('organizationId', '==', organizationId).get()).size
  ])))
}

function assertSafeInventoryDenial(result) {
  assert.equal(result.response.status, 400, JSON.stringify(result.body))
  assert.equal(result.body.error?.details?.reasonCode, 'FAILED_PRECONDITION', JSON.stringify(result.body))
  assert.ok(result.body.error?.details?.correlationId)
  const serialized = JSON.stringify(result.body)
  assert.equal(serialized.includes('stack'), false)
  assert.equal(serialized.includes('projects/'), false)
}

async function cleanup(db, auth, fixture) {
  await db.collection('recipes').doc(fixture.recipeId).collection('versions').doc('v1').delete().catch(() => undefined)
  for (const collection of [
    'organizations', 'branches', 'employees', 'employeeBranchAssignments', 'shifts', 'productCategories', 'products', 'recipes',
    'taxProfiles', 'taxConfigurationVersions', 'paymentMethods', 'ingredients', 'inventoryBatches', 'inventoryBalances', 'orders',
    'receipts', 'payments', 'stockMovements', 'journalEntries', 'journalLines', 'loyaltyTransactions', 'loyaltyBalances',
    'shiftTotals', 'appliedShiftSales', 'auditLogs', 'outboxEvents', 'saleIdempotency', 'saleCounters', 'cashierSaleSummaries'
  ]) {
    const snapshot = await db.collection(collection).get()
    await Promise.all(snapshot.docs
      .filter((entry) => entry.data().organizationId === fixture.organizationId || entry.id.includes(fixture.organizationId) || entry.id.includes(fixture.branchId))
      .map((entry) => entry.ref.delete()))
  }
  await auth.deleteUser(fixture.cashierId).catch(() => undefined)
}

test('completeSale rejects insufficient inventory when controlled negative inventory is disabled, then retries safely once enabled', { skip: !process.env.FIRESTORE_EMULATOR_HOST }, async () => {
  const { getAdminFirestore } = await import('../lib/shared/admin.js')
  const { getAuth } = await import('firebase-admin/auth')
  const db = getAdminFirestore()
  const auth = getAuth()
  const fixture = await seedTrustedShiftValidationFixture(db, auth, { prefix: 'negative-disabled-retry' })
  const idempotencyKey = 'negative-disabled-retry-key'
  try {
    await db.collection('inventoryBatches').doc(fixture.batchId).set({ remainingQuantity: 1, status: 'available' }, { merge: true })
    await db.collection('inventoryBalances').doc(`${fixture.branchId}_${fixture.ingredientId}`).set({
      organizationId: fixture.organizationId,
      storeId: fixture.branchId,
      ingredientId: fixture.ingredientId,
      quantityOnHand: 1,
      baseUnitId: 'g',
      allocatedPositiveQuantity: 0,
      negativeQuantity: 0,
      inventoryValue: 2,
      provisionalNegativeValue: 0,
      status: 'IN_STOCK',
      reconciliationRequired: false,
      lastMovementAt: new Date(),
      updatedAt: new Date()
    })
    const token = await signIn(auth, fixture)
    const before = await counts(db, fixture.organizationId)
    const batchBefore = (await db.collection('inventoryBatches').doc(fixture.batchId).get()).data()
    const balanceBefore = (await db.collection('inventoryBalances').doc(`${fixture.branchId}_${fixture.ingredientId}`).get()).data()

    const denied = await invoke(token, fixture, idempotencyKey)
    assertSafeInventoryDenial(denied)
    assert.deepEqual(await counts(db, fixture.organizationId), before, 'negative-disabled denial must not persist trusted sale effects')
    assert.deepEqual((await db.collection('inventoryBatches').doc(fixture.batchId).get()).data(), batchBefore)
    assert.deepEqual((await db.collection('inventoryBalances').doc(`${fixture.branchId}_${fixture.ingredientId}`).get()).data(), balanceBefore)
    assert.equal((await db.collection('saleIdempotency').doc(`${fixture.organizationId}_${idempotencyKey}`).get()).exists, false)

    await db.collection('ingredients').doc(fixture.ingredientId).set({ negativeInventoryAllowed: true }, { merge: true })
    const first = await invoke(token, fixture, idempotencyKey)
    assert.equal(first.response.status, 200, JSON.stringify(first.body))
    const saleId = first.body.result.saleId
    assert.equal(first.body.result.cogsStatus, 'MIXED')

    const sale = (await db.collection('orders').doc(saleId).get()).data()
    const receipt = (await db.collection('receipts').doc(saleId).get()).data()
    const summary = (await db.collection('cashierSaleSummaries').doc(saleId).get()).data()
    const balance = (await db.collection('inventoryBalances').doc(`${fixture.branchId}_${fixture.ingredientId}`).get()).data()
    const batch = (await db.collection('inventoryBatches').doc(fixture.batchId).get()).data()
    const movements = (await db.collection('stockMovements').where('saleId', '==', saleId).get()).docs.map((entry) => entry.data())
    assert.equal(sale?.confirmedCogs, 2)
    assert.equal(sale?.provisionalCogs, 2)
    assert.equal(sale?.estimatedCogs, 4)
    assert.equal(sale?.cogsStatus, 'MIXED')
    assert.equal(batch?.remainingQuantity, 0)
    assert.equal(batch?.status, 'depleted')
    assert.equal(balance?.quantityOnHand, -1)
    assert.equal(balance?.allocatedPositiveQuantity, 1)
    assert.equal(balance?.negativeQuantity, 1)
    assert.equal(balance?.provisionalNegativeValue, 2)
    assert.equal(balance?.status, 'RECONCILIATION_REQUIRED')
    assert.equal(balance?.reconciliationRequired, true)
    assert.equal(movements.length, 2)
    assert.deepEqual(movements.map((movement) => ({ quantity: movement.quantity, provisional: movement.provisional, movementType: movement.movementType })).sort((left, right) => Number(left.provisional) - Number(right.provisional)), [
      { quantity: 1, provisional: false, movementType: 'SALE_CONSUMPTION' },
      { quantity: 1, provisional: true, movementType: 'SALE_CONSUMPTION' }
    ])
    assert.equal(movements.find((movement) => movement.provisional)?.reconciliationExposure?.reconciliationStatus, 'pending')
    assert.equal(receipt?.saleId, saleId)
    assert.equal(summary?.saleId, saleId)
    assert.equal((await db.collection('auditLogs').doc(`SaleCompleted-${saleId}`).get()).data()?.event, 'SaleCompleted')
    assert.equal((await db.collection('outboxEvents').doc(`SaleCompleted-${saleId}`).get()).data()?.status, 'PENDING')
    assert.equal((await db.collection('saleIdempotency').doc(`${fixture.organizationId}_${idempotencyKey}`).get()).data()?.status, 'COMPLETED')

    const afterFirst = await counts(db, fixture.organizationId)
    const historicalSale = sale
    const historicalReceipt = receipt
    const historicalSummary = summary
    const historicalBalance = balance
    const retry = await invoke(token, fixture, idempotencyKey)
    assert.equal(retry.response.status, 200, JSON.stringify(retry.body))
    assert.deepEqual(retry.body.result, first.body.result)
    assert.deepEqual(await counts(db, fixture.organizationId), afterFirst, 'duplicate retry must not create inventory or trusted sale effects')
    assert.deepEqual((await db.collection('orders').doc(saleId).get()).data(), historicalSale)
    assert.deepEqual((await db.collection('receipts').doc(saleId).get()).data(), historicalReceipt)
    assert.deepEqual((await db.collection('cashierSaleSummaries').doc(saleId).get()).data(), historicalSummary)
    assert.deepEqual((await db.collection('inventoryBalances').doc(`${fixture.branchId}_${fixture.ingredientId}`).get()).data(), historicalBalance)
  } finally {
    await cleanup(db, auth, fixture)
  }
})

test('completeSale follows the configured policy after FIFO exhaustion', { skip: !process.env.FIRESTORE_EMULATOR_HOST }, async () => {
  const { getAdminFirestore } = await import('../lib/shared/admin.js')
  const { getAuth } = await import('firebase-admin/auth')
  const db = getAdminFirestore()
  const auth = getAuth()
  const fixture = await seedTrustedShiftValidationFixture(db, auth, { prefix: 'negative-fifo-exhausted' })
  const idempotencyKey = 'negative-fifo-exhausted-key'
  try {
    await db.collection('inventoryBatches').doc(fixture.batchId).set({ remainingQuantity: 0, status: 'depleted' }, { merge: true })
    await db.collection('ingredients').doc(fixture.ingredientId).set({ negativeInventoryAllowed: true }, { merge: true })
    const token = await signIn(auth, fixture)
    const result = await invoke(token, fixture, idempotencyKey)
    assert.equal(result.response.status, 200, JSON.stringify(result.body))
    assert.equal(result.body.result.cogsStatus, 'PROVISIONAL')
    const saleId = result.body.result.saleId
    const sale = (await db.collection('orders').doc(saleId).get()).data()
    const balance = (await db.collection('inventoryBalances').doc(`${fixture.branchId}_${fixture.ingredientId}`).get()).data()
    const movements = (await db.collection('stockMovements').where('saleId', '==', saleId).get()).docs.map((entry) => entry.data())
    assert.equal(sale?.confirmedCogs, 0)
    assert.equal(sale?.provisionalCogs, 4)
    assert.equal(sale?.estimatedCogs, 4)
    assert.equal(sale?.cogsStatus, 'PROVISIONAL')
    assert.equal(balance?.quantityOnHand, -2)
    assert.equal(balance?.negativeQuantity, 2)
    assert.equal(balance?.status, 'RECONCILIATION_REQUIRED')
    assert.equal(movements.length, 1)
    assert.equal(movements[0]?.movementType, 'SALE_CONSUMPTION')
    assert.equal(movements[0]?.provisional, true)
    assert.equal(movements[0]?.quantity, 2)
    assert.equal(movements[0]?.reconciliationExposure?.costSource, 'LATEST_BATCH_COST')
  } finally {
    await cleanup(db, auth, fixture)
  }
})
