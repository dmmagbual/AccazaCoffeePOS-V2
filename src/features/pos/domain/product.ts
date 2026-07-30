import type { Category } from './category'

export interface Modifier { id: string; name: string; required: boolean; options: readonly string[] }
export interface ProductVariant { id: string; name: string; sku: string; barcode: string; priceAdjustment: number; active: boolean }
export interface InventoryInfo { trackInventory: boolean; stockQuantity: number; minimumStock: number; maximumStock: number; unit: string }
export interface PricingInfo { cost: number; sellingPrice: number; currency: string }
export interface TaxInfo { taxable: boolean; taxRate: number }
export interface ImageInfo { url: string; alt: string }
export type ProductStatus = 'active' | 'inactive' | 'archived'

export interface Product {
  id: string
  name: string
  description: string
  category: Category
  sku: string
  barcode: string
  favorite: boolean
  available: boolean
  modifiers: readonly Modifier[]
  variants: readonly ProductVariant[]
  inventory: InventoryInfo
  pricing: PricingInfo
  tax: TaxInfo
  image: ImageInfo
  size: string
  unit: string
  tags: readonly string[]
  status: ProductStatus
}

export interface ProductCatalog { categories: readonly Category[]; products: readonly Product[] }
