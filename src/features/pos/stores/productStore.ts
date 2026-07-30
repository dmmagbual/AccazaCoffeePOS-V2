import { create } from 'zustand'
import { localProductCatalogService } from '../services'
import type { Product, ProductCatalog, Category } from '../domain'

export type ProductFilterCategory = 'all' | Category['id']
export type ProductCatalogStatus = 'idle' | 'loading' | 'ready' | 'error'

export interface ProductState {
  products: readonly Product[]
  categories: readonly Category[]
  selectedCategory: ProductFilterCategory
  searchFilter: string
  status: ProductCatalogStatus
  loadCatalog: () => Promise<void>
  setSelectedCategory: (category: ProductFilterCategory) => void
  setSearchFilter: (searchFilter: string) => void
}

const emptyCatalog: ProductCatalog = { categories: [], products: [] }

export const useProductStore = create<ProductState>((set, get) => ({
  ...emptyCatalog,
  selectedCategory: 'all',
  searchFilter: '',
  status: 'idle',
  loadCatalog: async () => {
    if (get().status === 'loading' || get().status === 'ready') return
    set({ status: 'loading' })
    try {
      const catalog = await localProductCatalogService.loadCatalog()
      set({ ...catalog, status: 'ready' })
    } catch {
      set({ status: 'error' })
    }
  },
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  setSearchFilter: (searchFilter) => set({ searchFilter }),
}))

export function filterProducts(products: readonly Product[], selectedCategory: ProductFilterCategory, searchFilter: string): readonly Product[] {
  const normalizedFilter = searchFilter.trim().toLocaleLowerCase()
  return products.filter((product) =>
    (selectedCategory === 'all' || product.category.id === selectedCategory)
    && product.name.toLocaleLowerCase().includes(normalizedFilter),
  )
}

export function getFavoriteProducts(products: readonly Product[]): readonly Product[] {
  return products.filter((product) => product.favorite && product.available)
}
