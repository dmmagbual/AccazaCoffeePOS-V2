export { completeSale } from './completeSale'
export { aggregateCompletedSales } from './dashboard'
export { createFirestoreSalePersistence, getConfiguredSalePersistence, localSalePersistence, useLocalSaleLedger } from './persistence'
export type { CompletedSaleItem, CompletedSaleOrder, CompleteSaleResult, SaleError, SaleFailureCode, SaleInput, SalePersistence, SaleStatus } from './contracts'
