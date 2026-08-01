import assert from 'node:assert/strict'
import test from 'node:test'
import { seedTrustedShiftValidationFixture } from './fixtures/trustedSaleFixture.mjs'

const protectedCollections = ['orders', 'receipts', 'payments', 'saleIdempotency', 'stockMovements', 'inventoryBalances', 'shiftTotals', 'journalEntries', 'loyaltyTransactions', 'auditLogs', 'outboxEvents', 'cashierSaleSummaries', 'appliedShiftSales']
const url = () => `http://127.0.0.1:5001/${process.env.GCLOUD_PROJECT ?? 'demo-no-project'}/asia-southeast1/completeSale`
const write = (db, collection, id, data, options) => db.collection(collection).doc(id).set(data, options)
async function counts(db) { return Object.fromEntries(await Promise.all(protectedCollections.map(async (name) => [name, (await db.collection(name).get()).size]))) }
async function signIn(auth, fixture) { const token = await auth.createCustomToken(fixture.cashierId, { organizationId: fixture.organizationId, branchId: fixture.branchId, employeeId: fixture.cashierId, permissions: ['sales.complete'] }); const response = await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=emulator', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token, returnSecureToken: true }) }); const body = await response.json(); assert.equal(response.status, 200, JSON.stringify(body)); return body.idToken }
async function invoke(token, data) { const response = await fetch(url(), { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` }, body: JSON.stringify({ data }) }); return { response, body: await response.json() } }
function sale(fixture, key, line) { return { idempotencyKey: key, requestedBranchId: fixture.branchId, shiftId: fixture.openShiftId, cartLines: [{ clientLineId: key, productId: fixture.productId, quantity: 1, ...line }], payments: [{ paymentMethodId: fixture.paymentMethodId, amount: 200, tenderedAmount: 200, currencyCode: 'PHP' }] } }
function assertDenied(result) { assert.ok(result.response.status >= 400, JSON.stringify(result.body)); assert.ok(result.body.error?.details?.correlationId); const text = JSON.stringify(result.body); assert.equal(text.includes('stack'), false); assert.equal(text.includes('projects/'), false) }
async function seedCatalog(db, fixture) {
  const primaryVariationId = 'catalog-primary-variation'; const otherVariationId = 'catalog-other-variation'; const disabledVariationId = 'catalog-disabled-variation'; const draftVariationId = 'catalog-draft-variation'; const shotGroupId = 'catalog-shot-group'; const syrupGroupId = 'catalog-syrup-group'; const otherGroupId = 'catalog-other-group'; const shotId = 'catalog-shot'; const decafId = 'catalog-decaf'; const vanillaId = 'catalog-vanilla'; const caramelId = 'catalog-caramel'; const disabledOptionId = 'catalog-disabled-option'; const otherOptionId = 'catalog-other-option'; const otherProductId = 'catalog-other-product'
  await write(db, 'inventoryBatches', fixture.batchId, { remainingQuantity: 100 }, { merge: true })
  await write(db, 'products', fixture.productId, { defaultVariationId: primaryVariationId }, { merge: true })
  await write(db, 'recipes', fixture.recipeId, { productVariationId: primaryVariationId }, { merge: true })
  const variation = (id, productId, active = true, status = 'PUBLISHED') => write(db, 'productVariations', id, { organizationId: fixture.organizationId, productId, code: id.toUpperCase(), name: id, variationType: 'SIZE', sellingPrice: 120, active, status, default: id === primaryVariationId })
  const group = (id, selectionType, maximumSelections) => write(db, 'optionGroups', id, { organizationId: fixture.organizationId, code: id.toUpperCase(), name: id, selectionType, minimumSelections: 0, maximumSelections, required: false, active: true })
  const option = (id, modifierGroupId, priceAdjustment, active = true, maximumQuantity = 1) => write(db, 'optionItems', id, { organizationId: fixture.organizationId, modifierGroupId, code: id.toUpperCase(), name: id, priceAdjustment, recipeAdjustmentType: 'NONE', ingredientEffects: [], active, maximumQuantity })
  await Promise.all([
    variation(primaryVariationId, fixture.productId), variation(otherVariationId, otherProductId), variation(disabledVariationId, fixture.productId, false), variation(draftVariationId, fixture.productId, true, 'DRAFT'),
    write(db, 'products', otherProductId, { organizationId: fixture.organizationId, productCode: 'OTHER', name: 'Other', productType: 'DRINK', categoryId: fixture.categoryId, active: true, status: 'ACTIVE', availableForSale: true, visibleOnPOS: true, baseSellingPrice: 100 }),
    group(shotGroupId, 'SINGLE', 1), group(syrupGroupId, 'MULTIPLE', 2), group(otherGroupId, 'SINGLE', 1),
    option(shotId, shotGroupId, 15), option(decafId, shotGroupId, 0), option(vanillaId, syrupGroupId, 10), option(caramelId, syrupGroupId, 12), option(disabledOptionId, syrupGroupId, 4, false), option(otherOptionId, otherGroupId, 8),
    write(db, 'productOptionAssignments', 'catalog-assignment-shot', { organizationId: fixture.organizationId, productId: fixture.productId, optionGroupId: shotGroupId, sortOrder: 1, active: true }),
    write(db, 'productOptionAssignments', 'catalog-assignment-syrup', { organizationId: fixture.organizationId, productId: fixture.productId, optionGroupId: syrupGroupId, sortOrder: 2, active: true }),
    write(db, 'productOptionAssignments', 'catalog-assignment-other', { organizationId: fixture.organizationId, productId: otherProductId, optionGroupId: otherGroupId, sortOrder: 1, active: true })
  ])
  return { primaryVariationId, otherVariationId, disabledVariationId, draftVariationId, shotId, decafId, vanillaId, caramelId, disabledOptionId, otherOptionId }
}
async function cleanup(db, auth, fixture) {
  await db.collection('recipes').doc(fixture.recipeId).collection('versions').doc('v1').delete().catch(() => undefined)
  for (const collection of ['orders', 'receipts', 'payments', 'saleIdempotency', 'stockMovements', 'inventoryBalances', 'shiftTotals', 'journalEntries', 'journalLines', 'loyaltyTransactions', 'loyaltyBalances', 'auditLogs', 'outboxEvents', 'cashierSaleSummaries', 'appliedShiftSales', 'productVariations', 'optionGroups', 'optionItems', 'productOptionAssignments', 'organizations', 'branches', 'employees', 'employeeBranchAssignments', 'shifts', 'productCategories', 'products', 'recipes', 'taxProfiles', 'taxConfigurationVersions', 'paymentMethods', 'ingredients', 'inventoryBatches']) { const snapshot = await db.collection(collection).get(); await Promise.all(snapshot.docs.filter((entry) => entry.data().organizationId === fixture.organizationId || entry.id.includes(fixture.organizationId) || entry.id.includes(fixture.branchId)).map((entry) => entry.ref.delete())) }
  await db.collection('saleCounters').doc(`${fixture.organizationId}_${fixture.branchId}`).delete().catch(() => undefined); await auth.deleteUser(fixture.cashierId).catch(() => undefined)
}

test('completeSale resolves product variations and options from authoritative catalog records', { skip: !process.env.FIRESTORE_EMULATOR_HOST }, async () => {
  const { getAdminFirestore } = await import('../lib/shared/admin.js'); const { getAuth } = await import('firebase-admin/auth'); const db = getAdminFirestore(); const auth = getAuth(); const fixture = await seedTrustedShiftValidationFixture(db, auth, { prefix: 'catalog-resolution' }); const catalog = await seedCatalog(db, fixture); const token = await signIn(auth, fixture)
  try {
    const defaultResult = await invoke(token, sale(fixture, 'catalog-default', { unitPrice: 0.01, taxRate: 0, recipeSnapshot: { forged: true }, cogs: 0 }))
    assert.equal(defaultResult.response.status, 200, JSON.stringify(defaultResult.body)); const defaultOrder = (await db.collection('orders').doc(defaultResult.body.result.saleId).get()).data(); assert.equal(defaultOrder?.lines[0].variationSnapshot?.variationId, catalog.primaryVariationId); assert.equal(defaultOrder?.lines[0].unitPrice, 120); assert.equal(defaultOrder?.lines[0].taxSnapshot.rateApplied, '0.1'); assert.equal(defaultOrder?.confirmedCogs, 4)
    const oneOption = await invoke(token, sale(fixture, 'catalog-one-option', { variationId: catalog.primaryVariationId, selectedOptionItemIds: [{ optionItemId: catalog.shotId }] }))
    assert.equal(oneOption.response.status, 200, JSON.stringify(oneOption.body)); const oneOrder = (await db.collection('orders').doc(oneOption.body.result.saleId).get()).data(); assert.equal(oneOrder?.lines[0].optionSnapshots[0].optionItemId, catalog.shotId); assert.equal(oneOrder?.lines[0].optionSnapshots[0].unitPriceAdjustment, 15)
    const multipleOptions = await invoke(token, sale(fixture, 'catalog-multiple-options', { variationId: catalog.primaryVariationId, selectedOptionItemIds: [{ optionItemId: catalog.shotId }, { optionItemId: catalog.vanillaId }] }))
    assert.equal(multipleOptions.response.status, 200, JSON.stringify(multipleOptions.body)); const multipleOrder = (await db.collection('orders').doc(multipleOptions.body.result.saleId).get()).data(); assert.deepEqual(multipleOrder?.lines[0].optionSnapshots.map((option) => option.optionItemId), [catalog.shotId, catalog.vanillaId])

    const denied = async (key, line) => { const before = await counts(db); const result = await invoke(token, sale(fixture, key, line)); assertDenied(result); assert.deepEqual(await counts(db), before, `${key} must not create sale effects`) }
    await denied('catalog-unknown-product', { productId: 'catalog-missing-product' })
    await denied('catalog-unknown-variation', { variationId: 'catalog-missing-variation' })
    await denied('catalog-wrong-product-variation', { variationId: catalog.otherVariationId })
    await denied('catalog-disabled-variation', { variationId: catalog.disabledVariationId })
    await denied('catalog-deleted-variation', { variationId: 'catalog-deleted-variation' })
    await denied('catalog-draft-variation', { variationId: catalog.draftVariationId })
    await denied('catalog-unknown-option', { variationId: catalog.primaryVariationId, selectedOptionItemIds: [{ optionItemId: 'catalog-missing-option' }] })
    await denied('catalog-other-product-option', { variationId: catalog.primaryVariationId, selectedOptionItemIds: [{ optionItemId: catalog.otherOptionId }] })
    await denied('catalog-disabled-option', { variationId: catalog.primaryVariationId, selectedOptionItemIds: [{ optionItemId: catalog.disabledOptionId }] })
    await denied('catalog-deleted-option', { variationId: catalog.primaryVariationId, selectedOptionItemIds: [{ optionItemId: 'catalog-deleted-option' }] })
    await denied('catalog-duplicate-option', { variationId: catalog.primaryVariationId, selectedOptionItemIds: [{ optionItemId: catalog.shotId }, { optionItemId: catalog.shotId }] })
    await denied('catalog-invalid-combination', { variationId: catalog.primaryVariationId, selectedOptionItemIds: [{ optionItemId: catalog.shotId }, { optionItemId: catalog.decafId }] })
    await denied('catalog-option-quantity', { variationId: catalog.primaryVariationId, selectedOptionItemIds: [{ optionItemId: catalog.shotId, quantity: 2 }] })
  } finally { await cleanup(db, auth, fixture) }
})
