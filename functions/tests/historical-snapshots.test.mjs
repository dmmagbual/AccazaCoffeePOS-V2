import assert from 'node:assert/strict'
import test from 'node:test'
import { seedTrustedShiftValidationFixture } from './fixtures/trustedSaleFixture.mjs'

const endpoint = () => `http://127.0.0.1:5001/${process.env.GCLOUD_PROJECT ?? 'demo-no-project'}/asia-southeast1/completeSale`
const historicalCollections = ['orders', 'receipts', 'payments', 'stockMovements', 'inventoryBalances', 'journalEntries', 'loyaltyTransactions', 'shiftTotals', 'auditLogs', 'outboxEvents', 'cashierSaleSummaries']

const normalize = (value) => {
  if (value === null || value === undefined || typeof value !== 'object') return value
  if (typeof value.toDate === 'function') return value.toDate().toISOString()
  if (Array.isArray(value)) return value.map(normalize)
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, normalize(value[key])]))
}
async function signIn(auth, fixture) { const token = await auth.createCustomToken(fixture.cashierId, { organizationId: fixture.organizationId, branchId: fixture.branchId, employeeId: fixture.cashierId, permissions: ['sales.complete'] }); const response = await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=emulator', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token, returnSecureToken: true }) }); const body = await response.json(); assert.equal(response.status, 200, JSON.stringify(body)); return body.idToken }
async function invoke(token, fixture, key) { const response = await fetch(endpoint(), { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` }, body: JSON.stringify({ data: { idempotencyKey: key, requestedBranchId: fixture.branchId, shiftId: fixture.openShiftId, cartLines: [{ clientLineId: key, productId: fixture.productId, variationId: `${fixture.organizationId}-variation`, quantity: 1, selectedOptionItemIds: [{ optionItemId: `${fixture.organizationId}-option` }] }], payments: [{ paymentMethodId: fixture.paymentMethodId, amount: 200, tenderedAmount: 200, currencyCode: 'PHP' }], customerId: `${fixture.organizationId}-customer` } }) }); return { response, body: await response.json() } }
async function capture(db, fixture, saleId) {
  const value = {}
  for (const collection of historicalCollections) { const snapshot = collection === 'inventoryBalances' || collection === 'shiftTotals' ? await db.collection(collection).doc(collection === 'inventoryBalances' ? `${fixture.branchId}_${fixture.ingredientId}` : fixture.openShiftId).get() : collection === 'journalEntries' ? await db.collection(collection).doc(`SALE-${saleId}`).get() : collection === 'loyaltyTransactions' ? await db.collection(collection).doc(`${saleId}-EARN`).get() : collection === 'auditLogs' ? await db.collection(collection).doc(`SaleCompleted-${saleId}`).get() : collection === 'outboxEvents' ? await db.collection(collection).doc(`SaleCompleted-${saleId}`).get() : collection === 'orders' || collection === 'receipts' || collection === 'cashierSaleSummaries' ? await db.collection(collection).doc(saleId).get() : await db.collection(collection).where('saleId', '==', saleId).get()
    value[collection] = normalize('docs' in snapshot ? snapshot.docs.map((entry) => entry.data()) : snapshot.data())
  }
  return value
}
async function seedHistoryData(db, fixture) {
  const org = fixture.organizationId; const variationId = `${org}-variation`; const groupId = `${org}-group`; const optionId = `${org}-option`; const optionIngredientId = `${org}-option-ingredient`; const customerId = `${org}-customer`
  const account = (id, code, accountType) => db.collection('chartAccounts').doc(`${org}-${id}`).set({ organizationId: org, branchId: null, code, name: code, accountType, active: true, systemAccount: true, allowManualPosting: true })
  await Promise.all([
    db.collection('inventoryBatches').doc(fixture.batchId).set({ remainingQuantity: 100 }, { merge: true }),
    db.collection('products').doc(fixture.productId).set({ defaultVariationId: variationId, sku: 'SKU-A', barcodeIds: ['BAR-A'], posLabel: 'Latte A' }, { merge: true }),
    db.collection('productVariations').doc(variationId).set({ organizationId: org, productId: fixture.productId, code: 'V-A', name: 'Large A', variationType: 'SIZE', sizeValue: 16, sizeUnitId: 'oz', temperature: 'HOT', sellingPrice: 120, active: true, status: 'PUBLISHED', default: true }),
    db.collection('recipes').doc(fixture.recipeId).set({ productVariationId: variationId, recipeName: 'Latte Recipe A' }, { merge: true }),
    db.collection('recipes').doc(fixture.recipeId).collection('versions').doc('v1').set({ businessVersion: 'A', packagingRequirements: [{ ingredientId: optionIngredientId, quantity: 1, unitId: 'piece' }] }, { merge: true }),
    db.collection('ingredients').doc(optionIngredientId).set({ organizationId: org, active: true, negativeInventoryAllowed: false }),
    db.collection('optionGroups').doc(groupId).set({ organizationId: org, code: 'ADDON-A', name: 'Add-ons A', selectionType: 'SINGLE', minimumSelections: 0, maximumSelections: 1, required: false, active: true }),
    db.collection('optionItems').doc(optionId).set({ organizationId: org, modifierGroupId: groupId, code: 'SHOT-A', name: 'Extra shot A', priceAdjustment: 15, taxProfileId: fixture.taxProfileId, recipeAdjustmentType: 'ADD_INGREDIENT', ingredientEffects: [{ ingredientId: optionIngredientId, quantity: 1, unitId: 'piece', action: 'ADD_INGREDIENT' }], active: true, maximumQuantity: 1 }),
    db.collection('productOptionAssignments').doc(`${org}-assignment`).set({ organizationId: org, productId: fixture.productId, variationId, optionGroupId: groupId, sortOrder: 1, active: true }),
    db.collection('customers').doc(customerId).set({ organizationId: org, active: true, displayName: 'Customer A', membershipTier: 'GOLD' }),
    db.collection('loyaltyPrograms').doc(`${org}-loyalty`).set({ organizationId: org, active: true, name: 'Points A', earnRate: 1, redemptionRate: 1 }),
    account('cash', 'CASH-A', 'ASSET'), account('revenue', 'REV-A', 'REVENUE'), account('tax', 'TAX-A', 'LIABILITY'), account('cogs', 'COGS-A', 'EXPENSE'), account('inventory', 'INV-A', 'ASSET'),
    db.collection('accountingPeriods').doc(`${org}-period`).set({ organizationId: org, startDate: new Date('2025-01-01'), endDate: new Date('2030-01-01'), status: 'OPEN' }),
    db.collection('financePostingConfigurations').doc(`${org}-finance`).set({ organizationId: org, enabled: true, cogsPostingEnabled: true, paymentAccountIds: { [fixture.paymentMethodId]: `${org}-cash` }, revenueAccountId: `${org}-revenue`, taxPayableAccountId: `${org}-tax`, costOfSalesAccountId: `${org}-cogs`, inventoryAccountId: `${org}-inventory` }),
    db.collection('paymentMethods').doc(fixture.paymentMethodId).set({ financialAccountId: `${org}-cash`, requiresTransactionReference: false }, { merge: true })
  ])
  return { variationId, groupId, optionId, customerId }
}
async function mutateLiveData(db, fixture, ids) {
  const org = fixture.organizationId
  await Promise.all([
    db.collection('products').doc(fixture.productId).set({ name: 'Latte B', productCode: 'LATTE-B', sku: 'SKU-B', barcodeIds: ['BAR-B'], posLabel: 'Latte B', categoryId: 'changed-category', status: 'ARCHIVED', active: false, baseSellingPrice: 999 }, { merge: true }),
    db.collection('productCategories').doc(fixture.categoryId).set({ name: 'Coffee B', code: 'COFFEE-B', active: false }, { merge: true }),
    db.collection('productVariations').doc(ids.variationId).set({ name: 'Large B', code: 'V-B', sizeValue: 24, sizeUnitId: 'ml', temperature: 'ICED', sellingPrice: 999, active: false, default: false }, { merge: true }),
    db.collection('optionGroups').doc(ids.groupId).set({ name: 'Add-ons B', maximumSelections: 9, active: false }, { merge: true }),
    db.collection('optionItems').doc(ids.optionId).set({ name: 'Extra shot B', code: 'SHOT-B', priceAdjustment: 999, ingredientEffects: [{ ingredientId: fixture.ingredientId, quantity: 9, unitId: 'g', action: 'REPLACE_RECIPE_COMPONENT', replacementIngredientId: fixture.ingredientId }], active: false }, { merge: true }),
    db.collection('productOptionAssignments').doc(`${org}-assignment`).set({ active: false, maximumOverride: 9 }, { merge: true }),
    db.collection('recipes').doc(fixture.recipeId).set({ activeVersionId: 'v2', recipeName: 'Latte Recipe B', published: false, recipeStatus: 'ARCHIVED' }, { merge: true }),
    db.collection('recipes').doc(fixture.recipeId).collection('versions').doc('v2').set({ organizationId: org, recipeId: fixture.recipeId, businessVersion: 'B', status: 'published', ingredients: [{ ingredientId: fixture.ingredientId, ingredientNameSnapshot: 'Replacement', baseUnitQuantity: 9, unitId: 'g', optional: false }], packagingRequirements: [], yieldQuantity: 9, yieldUnitId: 'cup' }),
    db.collection('taxProfiles').doc(fixture.taxProfileId).set({ name: 'Tax B', code: 'TAX-B', active: false }, { merge: true }),
    db.collection('taxConfigurationVersions').doc(`${fixture.taxProfileId}-v1`).set({ rate: '0.99', calculationMode: 'TAX_INCLUSIVE', roundingMethod: 'DOWN', roundingPrecision: 0, active: false, taxPayableAccountId: `${org}-tax-b` }, { merge: true }),
    db.collection('taxConfigurationVersions').doc(`${fixture.taxProfileId}-v2`).set({ organizationId: org, taxProfileId: fixture.taxProfileId, rate: '0.2', calculationMode: 'TAX_EXCLUSIVE', roundingMethod: 'HALF_UP', roundingPrecision: 2, active: true, effectiveFrom: new Date('2025-01-01') }),
    db.collection('paymentMethods').doc(fixture.paymentMethodId).set({ name: 'Cash B', code: 'CASH-B', settlementCategory: 'OTHER', financialAccountId: `${org}-cash-b`, branchIds: ['other-branch'], requiresTransactionReference: true, active: false }, { merge: true }),
    db.collection('customers').doc(ids.customerId).set({ displayName: 'Customer B', membershipTier: 'SILVER' }, { merge: true }),
    db.collection('loyaltyPrograms').doc(`${org}-loyalty`).set({ name: 'Points B', earnRate: 99, redemptionRate: 99 }, { merge: true }),
    db.collection('financePostingConfigurations').doc(`${org}-finance`).set({ paymentAccountIds: { [fixture.paymentMethodId]: `${org}-cash-b` }, revenueAccountId: `${org}-revenue-b`, taxPayableAccountId: `${org}-tax-b`, costOfSalesAccountId: `${org}-cogs-b`, inventoryAccountId: `${org}-inventory-b` }, { merge: true })
  ])
}
async function cleanup(db, auth, fixture) { await db.collection('recipes').doc(fixture.recipeId).collection('versions').doc('v1').delete().catch(() => undefined); await db.collection('recipes').doc(fixture.recipeId).collection('versions').doc('v2').delete().catch(() => undefined); const collections = ['organizations', 'branches', 'employees', 'employeeBranchAssignments', 'shifts', 'productCategories', 'products', 'productVariations', 'optionGroups', 'optionItems', 'productOptionAssignments', 'recipes', 'taxProfiles', 'taxConfigurationVersions', 'paymentMethods', 'ingredients', 'inventoryBatches', 'inventoryBalances', 'orders', 'receipts', 'payments', 'stockMovements', 'journalEntries', 'journalLines', 'loyaltyTransactions', 'loyaltyBalances', 'loyaltyPrograms', 'customers', 'shiftTotals', 'appliedShiftSales', 'auditLogs', 'outboxEvents', 'saleIdempotency', 'saleCounters', 'chartAccounts', 'accountingPeriods', 'financePostingConfigurations', 'cashierSaleSummaries']; for (const collection of collections) { const snapshot = await db.collection(collection).get(); await Promise.all(snapshot.docs.filter((entry) => entry.data().organizationId === fixture.organizationId || entry.id.includes(fixture.organizationId) || entry.id.includes(fixture.branchId)).map((entry) => entry.ref.delete())) } await auth.deleteUser(fixture.cashierId).catch(() => undefined) }

test('completed sales retain immutable historical snapshots after live master data changes', { skip: !process.env.FIRESTORE_EMULATOR_HOST }, async () => {
  const { getAdminFirestore } = await import('../lib/shared/admin.js'); const { getAuth } = await import('firebase-admin/auth'); const db = getAdminFirestore(); const auth = getAuth(); const fixture = await seedTrustedShiftValidationFixture(db, auth, { prefix: 'historical-snapshot' })
  try {
    const ids = await seedHistoryData(db, fixture); const token = await signIn(auth, fixture); const commandKey = 'historical-sale-a'; const first = await invoke(token, fixture, commandKey); assert.equal(first.response.status, 200, JSON.stringify(first.body)); const saleId = first.body.result.saleId; const baseline = await capture(db, fixture, saleId)
    assert.equal(baseline.orders.lines[0].productSnapshot.productName, 'Latte'); assert.equal(baseline.orders.lines[0].variationSnapshot.variationName, 'Large A'); assert.equal(baseline.orders.lines[0].optionSnapshots[0].optionItemName, 'Extra shot A'); assert.equal(baseline.orders.lines[0].recipeSnapshot.businessVersion, 'A'); assert.equal(baseline.payments[0].paymentMethodName, 'Cash'); assert.equal(baseline.receipts.payments[0].financialAccountId, undefined); assert.equal(baseline.journalEntries.saleId, saleId); assert.equal(baseline.loyaltyTransactions.saleId, saleId)
    await mutateLiveData(db, fixture, ids)
    assert.deepEqual(await capture(db, fixture, saleId), baseline, 'historical evidence must never be refreshed from current master data')
    const retry = await invoke(token, fixture, commandKey); assert.equal(retry.response.status, 200, JSON.stringify(retry.body)); assert.equal(retry.body.result.saleId, saleId); assert.deepEqual(await capture(db, fixture, saleId), baseline, 'completed retry must reuse immutable result without current master resolution')
    assert.equal((await db.collection('orders').where('organizationId', '==', fixture.organizationId).get()).size, 1); assert.equal((await db.collection('receipts').where('saleId', '==', saleId).get()).size, 1); assert.equal((await db.collection('payments').where('saleId', '==', saleId).get()).size, 1); assert.equal((await db.collection('stockMovements').where('saleId', '==', saleId).get()).size, 1)
  } finally { await cleanup(db, auth, fixture) }
})
