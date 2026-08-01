import { describe, expect, it } from 'vitest'
import { calculateProductionCost, completeProduction } from './productionService'
import type { ProductionOrder, ProductionRecipeVersion } from '../domain'

const now = new Date('2026-07-31T09:00:00.000Z')
const recipe: ProductionRecipeVersion = { id: 'version-1', organizationId: 'org-1', productionRecipeId: 'recipe-1', versionNumber: 1, producedItemId: 'simple-syrup', expectedYield: 3000, yieldUnitId: 'ml', shelfLifeDays: 7, inputs: [], status: 'approved', approvedBy: 'manager-1', approvedAt: now, createdAt: now, createdBy: 'manager-1' }
const order: ProductionOrder = { id: 'order-1', productionNumber: 'PO-001', organizationId: 'org-1', storeId: 'store-1', productionRecipeId: 'recipe-1', productionRecipeVersionId: 'version-1', plannedQuantity: 1, actualQuantity: null, expectedYield: 3000, wasteQuantity: 125, wasteReason: 'evaporation', wasteRecoverable: false, startedAt: now, completedAt: null, producedBy: 'kitchen-1', approvedBy: 'manager-1', shiftId: 'shift-1', status: 'in_progress', createdAt: now, updatedAt: now, createdBy: 'kitchen-1', updatedBy: 'kitchen-1' }

describe('production service', () => {
  it('calculates actual costs and cost per output unit', () => {
    expect(calculateProductionCost(900, 2875, { packagingCost: 50, utilitiesCost: 25, laborCost: 125, overheadCost: 0 }, 1000)).toMatchObject({ actualCost: 1100, variance: 100, costPerOutputUnit: 0.382609 })
  })
  it('creates an expiring traceable finished batch and yield variance', () => {
    const costs = calculateProductionCost(900, 2875, { packagingCost: 0, utilitiesCost: 0, laborCost: 0, overheadCost: 0 })
    const result = completeProduction(order, recipe, 2875, costs, now)
    expect(result.order.status).toBe('completed')
    expect(result.yieldVariance).toBe(-125)
    expect(result.batch).toMatchObject({ productionOrderId: 'order-1', productionRecipeVersionId: 'version-1', originalQuantity: 2875, remainingQuantity: 2875 })
    expect(result.batch.expiryDate).toEqual(new Date('2026-08-07T09:00:00.000Z'))
  })
})
