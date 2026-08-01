import { consumeInventory, type InventoryBalance, type InventoryConsumptionRequest } from '../inventory-consumption'
import type { InventoryBatch } from '../../features/procurement/domain'
import { calculateProductionCost, completeProduction } from '../../features/production/services'
import type { ProductionCost, ProductionOrder, ProductionRecipeVersion } from '../../features/production/domain'

export interface ProductionInputIssue {
  request: Omit<InventoryConsumptionRequest, 'consumptionType' | 'referenceId' | 'referenceNumber' | 'occurredAt' | 'performedBy' | 'shiftId'>
  batches: readonly InventoryBatch[]
  balance: InventoryBalance
}
export interface CompleteProductionCommand { order: ProductionOrder; recipeVersion: ProductionRecipeVersion; actualYield: number; inputIssues: readonly ProductionInputIssue[]; additionalCosts: Pick<ProductionCost, 'packagingCost' | 'utilitiesCost' | 'laborCost' | 'overheadCost'>; expectedCost?: number; occurredAt: Date }

/** Coordinates production completion; batch allocation remains in the shared inventory engine. */
export function executeCompleteProduction(command: CompleteProductionCommand) {
  if (command.recipeVersion.status !== 'approved') throw new Error('Only approved production recipe versions can be used.')
  const consumption = command.inputIssues.map(({ request, batches, balance }) => consumeInventory({ ...request, consumptionType: 'PRODUCTION', referenceType: 'productionOrder', referenceId: command.order.id, referenceNumber: command.order.productionNumber, occurredAt: command.occurredAt, performedBy: command.order.producedBy, shiftId: command.order.shiftId ?? undefined }, batches, balance))
  const consumedIngredientCost = consumption.reduce((total, result) => total + result.totalProvisionalCost, 0)
  const costs = calculateProductionCost(consumedIngredientCost, command.actualYield, command.additionalCosts, command.expectedCost ?? consumedIngredientCost)
  return { ...completeProduction(command.order, command.recipeVersion, command.actualYield, costs, command.occurredAt), costs, consumption }
}
