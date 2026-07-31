import type { Timestamp } from 'firebase/firestore'
export type DocumentId = string
export type DocumentStatus = 'active' | 'inactive' | 'archived' | 'draft' | 'completed' | 'cancelled'
export interface AuditMetadata { organizationId: DocumentId; storeId: DocumentId; createdAt: Timestamp; updatedAt: Timestamp; createdBy: DocumentId; updatedBy: DocumentId; status: DocumentStatus }
export interface OrganizationDocument extends AuditMetadata { name: string; legalName: string; tin: string }
export interface StoreDocument extends AuditMetadata { name: string; code: string; address: string; timezone: string }
export interface RoleDocument extends AuditMetadata { name: string; permissionIds: readonly DocumentId[] }
export interface PermissionDocument extends AuditMetadata { key: string; description: string }
export interface UserProfileDocument extends AuditMetadata { email: string; displayName: string; roleIds: readonly DocumentId[]; active: boolean }
export interface CategoryDocument extends AuditMetadata { name: string; description: string; sortOrder: number }
export interface ProductDocument extends AuditMetadata { categoryId: DocumentId; name: string; description: string; sku: string; barcode: string; sellingPrice: number; cost: number; taxable: boolean; imageUrl: string; favorite: boolean; available: boolean; trackInventory: boolean; minimumStock: number; maximumStock: number; tags: readonly string[] }
export interface ModifierDocument extends AuditMetadata { name: string; options: readonly string[]; required: boolean }
export interface RecipeDocument extends AuditMetadata { productId: DocumentId; lines: readonly { ingredientId: DocumentId; quantity: number; unit: string }[] }
export interface InventoryItemDocument extends AuditMetadata { productId?: DocumentId; ingredientId?: DocumentId; quantity: number; minimumStock: number; maximumStock: number; unit: string; lowStock: boolean }
export interface StockMovementDocument extends AuditMetadata { inventoryItemId: DocumentId; type: 'purchase' | 'sale' | 'adjustment' | 'waste' | 'transfer'; quantity: number; occurredAt: Timestamp; referenceId?: DocumentId }
export interface SupplierDocument extends AuditMetadata { name: string; contactName: string; email: string; phone: string }
export interface PurchaseOrderDocument extends AuditMetadata { supplierId: DocumentId; orderNumber: string; expectedAt?: Timestamp; total: number }
export interface CustomerDocument extends AuditMetadata { displayName: string; email?: string; phone?: string; searchName: string }
export interface LoyaltyAccountDocument extends AuditMetadata { customerId: DocumentId; points: number; tier: string }
export interface OrderDocument extends AuditMetadata { orderNumber: string; customerId?: DocumentId; subtotal: number; discount: number; tax: number; total: number; paymentStatus: 'unpaid' | 'partial' | 'paid' | 'refunded' }
export interface OrderItemIngredientSnapshotDocument { ingredientId: DocumentId; ingredientName: string; baseUnitQuantity: number; baseUnitCost: number; lineCost: number; source: 'recipe' | 'modifier' }
export interface OrderItemModifierSnapshotDocument { modifierId: DocumentId; name: string; sellingPriceAdjustment: number; ingredientCost: number; ingredients: readonly OrderItemIngredientSnapshotDocument[]; inventoryDeductionReady: boolean }
export interface OrderItemRecipeSnapshotDocument { productId: DocumentId; productName: string; productPrice: number; recipeId: DocumentId | null; recipeVersionId: DocumentId | null; recipeVersionNumber: number | null; ingredients: readonly OrderItemIngredientSnapshotDocument[]; modifiers: readonly OrderItemModifierSnapshotDocument[]; ingredientCost: number; modifierCost: number; totalEstimatedCogs: number; saleTimestamp: Timestamp }
export interface OrderItemDocument extends AuditMetadata { orderId: DocumentId; productId: DocumentId; recipeId?: DocumentId; recipeVersionId?: DocumentId; operationalSnapshot?: OrderItemRecipeSnapshotDocument; name: string; quantity: number; unitPrice: number; total: number }
export interface PaymentDocument extends AuditMetadata { orderId: DocumentId; method: string; amount: number; reference?: string; paidAt: Timestamp }
export interface ReceiptDocument extends AuditMetadata { orderId: DocumentId; receiptNumber: string; total: number; issuedAt: Timestamp }
export interface ShiftDocument extends AuditMetadata { userId: DocumentId; openedAt: Timestamp; closedAt?: Timestamp }
export interface CashDrawerDocument extends AuditMetadata { shiftId: DocumentId; openingAmount: number; closingAmount?: number }
export interface ExpenseDocument extends AuditMetadata { category: string; amount: number; incurredAt: Timestamp; description: string }
export interface AuditLogDocument extends AuditMetadata { action: string; entityType: string; entityId: DocumentId; before?: Record<string, unknown>; after?: Record<string, unknown> }
export interface AppSettingsDocument extends AuditMetadata { key: string; value: Record<string, unknown> }
