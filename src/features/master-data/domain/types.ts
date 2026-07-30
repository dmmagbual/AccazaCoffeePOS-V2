import type { Timestamp } from 'firebase/firestore'
export type MasterDataStatus = 'active' | 'inactive'
export interface MasterDataAudit { organizationId: string; storeId: string; createdAt: Timestamp; updatedAt: Timestamp; createdBy: string; updatedBy: string; status: MasterDataStatus }
export type UnitDimension = 'weight' | 'volume' | 'count'
export interface UnitOfMeasure extends MasterDataAudit { name: string; symbol: string; dimension: UnitDimension; baseFactor: number }
export interface ProductCategory extends MasterDataAudit { name: string; description: string; sortOrder: number }
export interface IngredientCategory extends MasterDataAudit { name: string; description: string }
export interface PaymentMethod extends MasterDataAudit { name: string; code: string; enabled: boolean }
export interface TaxRate extends MasterDataAudit { name: string; rate: number; inclusive: boolean }
export interface StoreLocation extends MasterDataAudit { name: string; code: string; address: string; timezone: string }
export interface CompanySettings extends MasterDataAudit { legalName: string; displayName: string; tin: string; currency: string; receiptFooter: string }
