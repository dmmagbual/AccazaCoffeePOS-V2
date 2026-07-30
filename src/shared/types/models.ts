export type EntityId = string
export type ISODateString = string
export type UserRole = 'administrator' | 'manager' | 'cashier' | 'barista'
export interface User { id: EntityId; displayName: string; email: string; role: UserRole; branchId: EntityId; createdAt: ISODateString }
export interface Product { id: EntityId; name: string; sku: string; categoryId: EntityId; price: number; stockOnHand: number; reorderPoint: number; active: boolean }
export interface OrderLine { productId: EntityId; name: string; quantity: number; unitPrice: number }
export type OrderStatus = 'open' | 'paid' | 'preparing' | 'ready' | 'completed' | 'voided'
export interface Order { id: EntityId; number: string; customerId?: EntityId; lines: OrderLine[]; subtotal: number; total: number; status: OrderStatus; createdAt: ISODateString }
