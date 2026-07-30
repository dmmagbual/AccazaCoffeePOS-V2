import type { CategoryDocument, CustomerDocument, InventoryItemDocument, OrderDocument, PaymentDocument, ProductDocument, SupplierDocument, UserProfileDocument } from './types'
export interface ScopedRepository<T> { getById(id: string): Promise<T | null>; list(organizationId: string, storeId: string): Promise<readonly T[]>; create(document: T): Promise<T>; update(id: string, updates: Partial<T>): Promise<void> }
export type ProductRepository = ScopedRepository<ProductDocument>
export type CategoryRepository = ScopedRepository<CategoryDocument>
export type OrderRepository = ScopedRepository<OrderDocument>
export type PaymentRepository = ScopedRepository<PaymentDocument>
export type InventoryRepository = ScopedRepository<InventoryItemDocument>
export type SupplierRepository = ScopedRepository<SupplierDocument>
export type CustomerRepository = ScopedRepository<CustomerDocument>
export type UserRepository = ScopedRepository<UserProfileDocument>
