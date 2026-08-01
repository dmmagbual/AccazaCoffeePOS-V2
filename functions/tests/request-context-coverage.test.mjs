import assert from 'node:assert/strict'
import test from 'node:test'
import { seedTrustedShiftValidationFixture } from './fixtures/trustedSaleFixture.mjs'

const effects = ['orders', 'orderItems', 'receipts', 'payments', 'saleIdempotency', 'stockMovements', 'inventoryBalances', 'shiftTotals', 'journalEntries', 'loyaltyTransactions', 'auditLogs', 'outboxEvents', 'cashierSaleSummaries', 'appliedShiftSales', 'financePostingRequests', 'loyaltyPostingRequests']
const callableUrl = () => `http://127.0.0.1:5001/${process.env.GCLOUD_PROJECT ?? 'demo-no-project'}/asia-southeast1/completeSale`

async function counts(db) { return Object.fromEntries(await Promise.all(effects.map(async (name) => [name, (await db.collection(name).get()).size]))) }
async function signIn(auth, uid, claims) {
  const token = await auth.createCustomToken(uid, claims)
  const response = await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=emulator', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token, returnSecureToken: true }) })
  const body = await response.json()
  assert.equal(response.status, 200, JSON.stringify(body))
  return body.idToken
}
async function invoke(idToken, data) {
  const response = await fetch(callableUrl(), { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${idToken}` }, body: JSON.stringify({ data }) })
  return { response, body: await response.json() }
}
function command(fixture, suffix, shiftId = fixture.openShiftId) { return { idempotencyKey: `context-${suffix}`, requestedBranchId: fixture.branchId, shiftId, cartLines: [{ clientLineId: 'line', productId: fixture.productId, quantity: 1 }], payments: [{ paymentMethodId: fixture.paymentMethodId, amount: 110, currencyCode: 'PHP' }] } }
function assertSafeDenial(result, status, reasonCode) {
  assert.equal(result.response.status, status, JSON.stringify(result.body))
  assert.equal(result.body.error?.details?.reasonCode, reasonCode, JSON.stringify(result.body))
  assert.ok(result.body.error?.details?.correlationId)
  const serialized = JSON.stringify(result.body)
  assert.equal(serialized.includes('stack'), false)
  assert.equal(serialized.includes('projects/'), false)
  assert.equal(serialized.includes('firestore.googleapis.com'), false)
}
async function cleanup(db, auth, fixture) {
  await db.collection('recipes').doc(fixture.recipeId).collection('versions').doc('v1').delete().catch(() => undefined)
  for (const name of ['orders', 'orderItems', 'receipts', 'payments', 'saleIdempotency', 'stockMovements', 'inventoryBalances', 'shiftTotals', 'journalEntries', 'journalLines', 'loyaltyTransactions', 'loyaltyBalances', 'auditLogs', 'outboxEvents', 'cashierSaleSummaries', 'appliedShiftSales', 'financePostingRequests', 'loyaltyPostingRequests', 'organizations', 'branches', 'employees', 'employeeBranchAssignments', 'shifts', 'productCategories', 'products', 'recipes', 'taxProfiles', 'taxConfigurationVersions', 'paymentMethods', 'ingredients', 'inventoryBatches']) {
    const snapshot = await db.collection(name).get()
    await Promise.all(snapshot.docs.filter((entry) => entry.data().organizationId === fixture.organizationId || entry.id.includes(fixture.organizationId) || entry.id.includes(fixture.branchId)).map((entry) => entry.ref.delete()))
  }
  await db.collection('saleCounters').doc(`${fixture.organizationId}_${fixture.branchId}`).delete().catch(() => undefined)
  await auth.deleteUser(fixture.cashierId).catch(() => undefined)
}
async function withFixture(db, auth, prefix, callback) {
  const fixture = await seedTrustedShiftValidationFixture(db, auth, { prefix })
  try { await callback(fixture) } finally { await cleanup(db, auth, fixture) }
}

test('completeSale resolves trusted request contexts before transaction effects', { skip: !process.env.FIRESTORE_EMULATOR_HOST }, async () => {
  const { getAdminFirestore } = await import('../lib/shared/admin.js')
  const { getAuth } = await import('firebase-admin/auth')
  const db = getAdminFirestore()
  const auth = getAuth()

  await withFixture(db, auth, 'context-authorized', async (fixture) => {
    const token = await signIn(auth, fixture.cashierId, { organizationId: fixture.organizationId, branchId: fixture.branchId, employeeId: fixture.cashierId, permissions: ['sales.complete'] })
    const result = await invoke(token, command(fixture, 'authorized'))
    assert.equal(result.response.status, 200, JSON.stringify(result.body))
    assert.ok(result.body.result?.saleId)
    assert.ok(result.body.result?.receiptNumber)
    assert.ok(result.body.result?.correlationId)
  })

  const denied = async (prefix, claims, mutate, status, reasonCode, shiftId = (fixture) => fixture.openShiftId) => withFixture(db, auth, prefix, async (fixture) => {
    await mutate(fixture)
    const before = await counts(db)
    const token = await signIn(auth, fixture.cashierId, claims(fixture))
    const result = await invoke(token, command(fixture, prefix, shiftId(fixture)))
    assertSafeDenial(result, status, reasonCode)
    assert.deepEqual(await counts(db), before, `${reasonCode} must not create trusted sale effects`)
  })

  await denied('context-other-branch', (fixture) => ({ organizationId: fixture.organizationId, branchId: `${fixture.branchId}-other`, employeeId: fixture.cashierId, permissions: ['sales.complete'] }), async (fixture) => { await db.collection('branches').doc(`${fixture.branchId}-other`).set({ organizationId: fixture.organizationId, active: true, timezone: 'UTC', currencyCode: 'PHP' }) }, 403, 'BRANCH_ACCESS_DENIED')
  await denied('context-other-organization', (fixture) => ({ organizationId: `${fixture.organizationId}-other`, branchId: fixture.branchId, employeeId: fixture.cashierId, permissions: ['sales.complete'] }), async (fixture) => { await db.collection('organizations').doc(`${fixture.organizationId}-other`).set({ active: true }) }, 403, 'ORGANIZATION_ACCESS_DENIED')
  await denied('context-inactive-employee', (fixture) => ({ organizationId: fixture.organizationId, branchId: fixture.branchId, employeeId: fixture.cashierId, permissions: ['sales.complete'] }), async (fixture) => { await db.collection('employees').doc(fixture.cashierId).set({ active: false }, { merge: true }) }, 400, 'EMPLOYEE_INACTIVE')
  await denied('context-missing-assignment', (fixture) => ({ organizationId: fixture.organizationId, branchId: fixture.branchId, employeeId: fixture.cashierId, permissions: ['sales.complete'] }), async (fixture) => { await db.collection('employeeBranchAssignments').doc(`${fixture.cashierId}-${fixture.branchId}`).delete() }, 403, 'EMPLOYEE_BRANCH_ASSIGNMENT_MISSING')
  await denied('context-no-open-shift', (fixture) => ({ organizationId: fixture.organizationId, branchId: fixture.branchId, employeeId: fixture.cashierId, permissions: ['sales.complete'] }), async (fixture) => { await db.collection('shifts').doc(fixture.openShiftId).delete() }, 400, 'OPEN_SHIFT_REQUIRED')
  await denied('context-closed-shift', (fixture) => ({ organizationId: fixture.organizationId, branchId: fixture.branchId, employeeId: fixture.cashierId, permissions: ['sales.complete'] }), async () => undefined, 400, 'SHIFT_CLOSED', (fixture) => fixture.closedShiftId)
  await denied('context-missing-pos-permission', (fixture) => ({ organizationId: fixture.organizationId, branchId: fixture.branchId, employeeId: fixture.cashierId, permissions: [] }), async () => undefined, 403, 'POS_PERMISSION_DENIED')
  await denied('context-head-office-without-checkout', (fixture) => ({ organizationId: fixture.organizationId, branchId: fixture.branchId, employeeId: fixture.cashierId, headOfficeScope: true, permissions: ['operations.read'] }), async () => undefined, 403, 'POS_PERMISSION_DENIED')
  await denied('context-franchise-cross-sale', (fixture) => ({ organizationId: fixture.organizationId, branchId: fixture.branchId, employeeId: fixture.cashierId, franchiseOrganizationId: `${fixture.organizationId}-franchise`, permissions: ['sales.complete'] }), async (fixture) => { await db.collection('organizations').doc(`${fixture.organizationId}-franchise`).set({ active: true }) }, 403, 'ORGANIZATION_ACCESS_DENIED')
})
