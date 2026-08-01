import assert from 'node:assert/strict'
import test from 'node:test'
import { seedTrustedShiftValidationFixture } from './fixtures/trustedSaleFixture.mjs'

const endpoint = () => `http://127.0.0.1:5001/${process.env.GCLOUD_PROJECT ?? 'demo-no-project'}/asia-southeast1/completeSale`
const trustedEffects = ['orders', 'receipts', 'payments', 'saleIdempotency', 'stockMovements', 'inventoryBalances', 'shiftTotals', 'journalEntries', 'loyaltyTransactions', 'auditLogs', 'outboxEvents', 'cashierSaleSummaries', 'appliedShiftSales']

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

function command(fixture, idempotencyKey, requestedRedemptionPoints = 10) {
  return {
    idempotencyKey,
    requestedBranchId: fixture.branchId,
    shiftId: fixture.openShiftId,
    customerId: `${fixture.organizationId}-customer`,
    requestedRedemptionPoints,
    cartLines: [{ clientLineId: `${idempotencyKey}-line`, productId: fixture.productId, quantity: 1 }],
    payments: [{ paymentMethodId: fixture.paymentMethodId, amount: 100, currencyCode: 'PHP' }]
  }
}

async function invoke(token, data) {
  const response = await fetch(endpoint(), {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
    body: JSON.stringify({ data })
  })
  return { response, body: await response.json() }
}

async function effectCounts(db, organizationId) {
  return Object.fromEntries(await Promise.all(trustedEffects.map(async (collection) => [
    collection,
    (await db.collection(collection).where('organizationId', '==', organizationId).get()).size
  ])))
}

async function seedRedemption(db, fixture, options = {}) {
  const customerId = `${fixture.organizationId}-customer`
  const programId = `${fixture.organizationId}-loyalty`
  await Promise.all([
    db.collection('customers').doc(customerId).set({ organizationId: options.customerOrganizationId ?? fixture.organizationId, active: options.customerActive ?? true, displayName: 'Loyalty customer' }),
    db.collection('loyaltyPrograms').doc(programId).set({ organizationId: fixture.organizationId, active: options.programActive ?? true, earnRate: 0, redemptionRate: 1, minimumRedemptionPoints: 10, effectiveFrom: options.effectiveFrom ?? new Date('2020-01-01'), ...(options.effectiveTo ? { effectiveTo: options.effectiveTo } : {}) }),
    db.collection('loyaltyBalances').doc(customerId).set({ organizationId: options.balanceOrganizationId ?? fixture.organizationId, customerId, availablePoints: options.availablePoints ?? 100, reservedPoints: 0, updatedAt: new Date() })
  ])
  return { customerId, programId }
}

function assertSafeDenial(result, expectedStatus) {
  assert.equal(result.response.status, expectedStatus, JSON.stringify(result.body))
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
    'loyaltyPrograms', 'customers', 'shiftTotals', 'appliedShiftSales', 'auditLogs', 'outboxEvents', 'saleIdempotency',
    'saleCounters', 'cashierSaleSummaries', 'loyaltyPostingRequests'
  ]) {
    const snapshot = await db.collection(collection).get()
    await Promise.all(snapshot.docs
      .filter((entry) => entry.data().organizationId === fixture.organizationId || entry.id.includes(fixture.organizationId) || entry.id.includes(fixture.branchId))
      .map((entry) => entry.ref.delete()))
  }
  await auth.deleteUser(fixture.cashierId).catch(() => undefined)
}

test('completeSale redeems configured loyalty points once and preserves immutable redemption evidence on retry', { skip: !process.env.FIRESTORE_EMULATOR_HOST }, async () => {
  const { getAdminFirestore } = await import('../lib/shared/admin.js')
  const { getAuth } = await import('firebase-admin/auth')
  const db = getAdminFirestore()
  const auth = getAuth()
  const fixture = await seedTrustedShiftValidationFixture(db, auth, { prefix: 'loyalty-redemption-success' })
  const idempotencyKey = 'loyalty-redemption-success-key'
  try {
    const { customerId } = await seedRedemption(db, fixture)
    const token = await signIn(auth, fixture)
    const first = await invoke(token, command(fixture, idempotencyKey))
    assert.equal(first.response.status, 200, JSON.stringify(first.body))
    assert.equal(first.body.result.grandTotal, 100)
    const saleId = first.body.result.saleId
    const sale = (await db.collection('orders').doc(saleId).get()).data()
    const receipt = (await db.collection('receipts').doc(saleId).get()).data()
    const balance = (await db.collection('loyaltyBalances').doc(customerId).get()).data()
    const redemption = (await db.collection('loyaltyTransactions').doc(`${saleId}-REDEEM`).get()).data()
    assert.equal(balance?.availablePoints, 90)
    assert.equal(redemption?.type, 'REDEEM')
    assert.equal(redemption?.points, 10)
    assert.equal(redemption?.pointsBefore, 100)
    assert.equal(redemption?.pointsAfter, 90)
    assert.equal(sale?.discountAmount, 10)
    assert.equal(sale?.grandTotal, 100)
    assert.deepEqual(sale?.loyaltySnapshot, { customer: { customerId, displayName: 'Loyalty customer' }, program: { programId: `${fixture.organizationId}-loyalty` }, pointsEarned: 0, pointsRedeemed: 10, redemptionAmount: 10 })
    assert.equal(receipt?.discountAmount, 10)
    assert.deepEqual(receipt?.loyaltyRedemption, { pointsRedeemed: 10, redemptionAmount: 10 })
    assert.equal((await db.collection('auditLogs').doc(`SaleCompleted-${saleId}`).get()).data()?.event, 'SaleCompleted')
    assert.equal((await db.collection('outboxEvents').doc(`SaleCompleted-${saleId}`).get()).data()?.status, 'PENDING')
    assert.equal((await db.collection('saleIdempotency').doc(`${fixture.organizationId}_${idempotencyKey}`).get()).data()?.status, 'COMPLETED')
    const countsBeforeRetry = await effectCounts(db, fixture.organizationId)
    const historicalReceipt = receipt
    const historicalSale = sale

    const retry = await invoke(token, command(fixture, idempotencyKey))
    assert.equal(retry.response.status, 200, JSON.stringify(retry.body))
    assert.deepEqual(retry.body.result, first.body.result)
    assert.deepEqual(await effectCounts(db, fixture.organizationId), countsBeforeRetry)
    assert.equal((await db.collection('loyaltyTransactions').where('saleId', '==', saleId).get()).size, 1)
    assert.deepEqual((await db.collection('orders').doc(saleId).get()).data(), historicalSale)
    assert.deepEqual((await db.collection('receipts').doc(saleId).get()).data(), historicalReceipt)
    assert.equal((await db.collection('loyaltyBalances').doc(customerId).get()).data()?.availablePoints, 90)

    const changed = await invoke(token, command(fixture, idempotencyKey, 20))
    assert.equal(changed.response.status, 409, JSON.stringify(changed.body))
    assert.equal(changed.body.error?.details?.reasonCode, 'ALREADY_EXISTS')
    assert.ok(changed.body.error?.details?.correlationId)
    assert.deepEqual(await effectCounts(db, fixture.organizationId), countsBeforeRetry)
    assert.equal((await db.collection('loyaltyBalances').doc(customerId).get()).data()?.availablePoints, 90)
  } finally {
    await cleanup(db, auth, fixture)
  }
})

test('completeSale rejects invalid loyalty redemption conditions without sale effects or point deductions', { skip: !process.env.FIRESTORE_EMULATOR_HOST }, async () => {
  const { getAdminFirestore } = await import('../lib/shared/admin.js')
  const { getAuth } = await import('firebase-admin/auth')
  const db = getAdminFirestore()
  const auth = getAuth()
  const cases = [
    { name: 'insufficient-points', options: { availablePoints: 5 }, status: 400 },
    { name: 'inactive-loyalty-account', options: { customerActive: false }, status: 400 },
    { name: 'expired-reward', options: { effectiveTo: new Date('2000-01-01') }, status: 400 },
    { name: 'wrong-organization', options: { customerOrganizationId: 'loyalty-redemption-wrong-org' }, status: 403 }
  ]
  for (const scenario of cases) {
    const fixture = await seedTrustedShiftValidationFixture(db, auth, { prefix: `loyalty-redemption-${scenario.name}` })
    try {
      const { customerId } = await seedRedemption(db, fixture, scenario.options)
      const token = await signIn(auth, fixture)
      const beforeEffects = await effectCounts(db, fixture.organizationId)
      const balanceBefore = (await db.collection('loyaltyBalances').doc(customerId).get()).data()
      const result = await invoke(token, command(fixture, `loyalty-redemption-${scenario.name}-key`))
      assertSafeDenial(result, scenario.status)
      assert.deepEqual(await effectCounts(db, fixture.organizationId), beforeEffects, `${scenario.name} must not create trusted sale effects`)
      assert.deepEqual((await db.collection('loyaltyBalances').doc(customerId).get()).data(), balanceBefore, `${scenario.name} must not deduct points`)
    } finally {
      await cleanup(db, auth, fixture)
    }
  }
})
