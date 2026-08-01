import assert from 'node:assert/strict'
import test from 'node:test'
import { consumeInventory } from '@abp/inventory-consumption'

test('Functions runtime imports the shared inventory package', () => {
  const result = consumeInventory({ organizationId: 'org', storeId: 'store', ingredientId: 'ingredient', quantity: 1, unitId: 'g', baseUnitId: 'g', conversionFactor: 1, consumptionType: 'SALE_CONSUMPTION', referenceType: 'sale', referenceId: 'sale', referenceNumber: 'sale', occurredAt: new Date(), performedBy: 'user', idempotencyKey: 'key' }, [{ id: 'batch', organizationId: 'org', storeId: 'store', batchNumber: 'B1', ingredientId: 'ingredient', supplierId: null, purchaseReference: 'receipt', receivedDate: new Date(0), expiryDate: null, remainingQuantity: 1, unitId: 'g', unitCost: 2, status: 'available', createdAt: new Date(0), updatedAt: new Date(0) }], { organizationId: 'org', storeId: 'store', ingredientId: 'ingredient', quantityOnHand: 1, baseUnitId: 'g', allocatedPositiveQuantity: 0, negativeQuantity: 0, inventoryValue: 2, provisionalNegativeValue: 0, status: 'IN_STOCK', reconciliationRequired: false, lastMovementAt: new Date(0), updatedAt: new Date(0) })
  assert.equal(result.confirmedFIFOCost, 2)
})
