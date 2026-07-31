import type { GoodsReceipt, InventoryBatch, PurchaseOrder, Supplier } from '../domain'
export interface ProcurementRepository<T> { list(organizationId: string, storeId?: string): Promise<readonly T[]>; create(document: T): Promise<T>; update(id: string, updates: Partial<T>): Promise<void> }
export type SupplierRepository = ProcurementRepository<Supplier>
export type PurchaseOrderRepository = ProcurementRepository<PurchaseOrder>
export type GoodsReceiptRepository = ProcurementRepository<GoodsReceipt>
export type InventoryBatchRepository = ProcurementRepository<InventoryBatch>
