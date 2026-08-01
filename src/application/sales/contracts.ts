import type { CartDiscount, CartItem, Payment, PaymentSummary, Receipt } from '../../features/pos/domain'
import type { OrderItemRecipeSnapshot } from '../operational'

export type SaleStatus = 'draft' | 'pending_payment' | 'completed' | 'failed' | 'voided' | 'refunded'
export type SaleFailureCode = 'empty_cart' | 'invalid_quantity' | 'pricing_mismatch' | 'payment_mismatch' | 'payment_reference_missing' | 'operational_error' | 'persistence_error' | 'duplicate_submission' | 'offline_unavailable' | 'trusted_validation_error' | 'idempotency_conflict'
export interface SaleError { code: SaleFailureCode; message: string; recoverable: boolean; correlationId?: string }
export interface SaleInput { organizationId: string; storeId: string; cashierId: string; shiftId?: string; items: readonly CartItem[]; discount: CartDiscount | null; taxRate: number; customerId?: string; payments: readonly Payment[]; notes?: string; saleTimestamp: Date; idempotencyKey?: string }
export interface CompletedSaleItem { productId: string; productName: string; sku: string; barcode: string; sellingPrice: number; quantity: number; discountAllocation: number; taxAllocation: number; snapshot: OrderItemRecipeSnapshot; estimatedItemCogs: number; lineTotal: number; saleTimestamp: Date }
export interface CompletedSaleOrder { id: string; idempotencyKey: string; orderNumber: string; status: 'completed'; organizationId: string; storeId: string; cashierId: string; shiftId?: string; customerId?: string; items: readonly CompletedSaleItem[]; payments: readonly Payment[]; subtotal: number; discount: number; tax: number; total: number; estimatedCogs: number; notes?: string; saleTimestamp: Date }
export interface SalePersistence { saveCompletedSale(sale: CompletedSaleOrder, payments: readonly Payment[], receipt: Receipt): Promise<void> }
export type CompleteSaleResult = { success: true; orderId: string; orderNumber: string; receipt: Receipt; paymentSummary: PaymentSummary; total: number; change: number; estimatedCogs: number; warnings: readonly string[] } | { success: false; error: SaleError; warnings: readonly string[] }
