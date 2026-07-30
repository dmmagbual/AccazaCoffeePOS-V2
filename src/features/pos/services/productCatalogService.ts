import catalogJson from '../data/products.json'
import type { Category, Product, ProductCatalog } from '../domain'
import { productCatalogSchema } from '../types'

export interface ProductCatalogService { loadCatalog: () => Promise<ProductCatalog> }

interface LocalCategory { id: string; name: string }
interface LocalProduct { id: string; name: string; categoryId: string; price: number; sku: string; barcode: string; image: string; stockQuantity: number; availability: 'available' | 'unavailable'; favorite: boolean }
interface LocalCatalog { categories: readonly LocalCategory[]; products: readonly LocalProduct[] }

function toCategory(category: LocalCategory): Category { return { ...category, description: '', active: true } }
function toProduct(product: LocalProduct, category: Category): Product {
  return { id: product.id, name: product.name, description: '', category, sku: product.sku, barcode: product.barcode, favorite: product.favorite, available: product.availability === 'available' && product.stockQuantity > 0, modifiers: [], variants: [], inventory: { trackInventory: true, stockQuantity: product.stockQuantity, minimumStock: 5, maximumStock: 100, unit: 'serving' }, pricing: { cost: product.price * 0.4, sellingPrice: product.price, currency: 'PHP' }, tax: { taxable: true, taxRate: 0 }, image: { url: product.image, alt: product.name }, size: 'Regular', unit: 'serving', tags: [category.id], status: product.availability === 'available' ? 'active' : 'inactive' }
}

export const localProductCatalogService: ProductCatalogService = { loadCatalog: async () => {
  const localCatalog = catalogJson as LocalCatalog
  const categories = localCatalog.categories.map(toCategory)
  const categoryById = new Map(categories.map((category) => [category.id, category]))
  const products = localCatalog.products.map((product) => {
    const category = categoryById.get(product.categoryId)
    if (!category) throw new Error(`Unknown product category: ${product.categoryId}`)
    return toProduct(product, category)
  })
  return productCatalogSchema.parse({ categories, products })
} }
