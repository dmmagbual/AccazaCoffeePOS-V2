export { consumeInventory } from '@abp/inventory-consumption'
/* Legacy entry point retained for application consumers; implementation is shared. */
/*
const precision = 1000000
const round = (value: number) => Math.round(value * precision) / precision
const at = (value: Date | { toDate(): Date }) => value instanceof Date ? value.getTime() : value.toDate().getTime()
function negativeCost(request: InventoryConsumptionRequest, batches: readonly InventoryBatch[]): { cost: number; source: NegativeCostSource } { const latest = [...batches].sort((a, b) => at(b.receivedDate) - at(a.receivedDate))[0]; if (latest?.unitCost) return { cost: latest.unitCost, source: 'LATEST_BATCH_COST' }; if (request.standardUnitCost && request.standardUnitCost > 0) return { cost: request.standardUnitCost, source: 'STANDARD_COST' }; if (request.lastPurchaseCost && request.lastPurchaseCost > 0) return { cost: request.lastPurchaseCost, source: 'LAST_PURCHASE_COST' }; return { cost: 0, source: 'NO_COST_AVAILABLE' } }
*/
