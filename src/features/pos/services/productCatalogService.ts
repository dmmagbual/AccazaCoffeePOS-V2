import type { ProductCatalog } from '../domain'

export interface ProductCatalogService { loadCatalog: () => Promise<ProductCatalog> }

/** Production intentionally starts empty until a repository-backed catalog is configured. */
export const localProductCatalogService: ProductCatalogService = { loadCatalog: async () => ({ categories: [], products: [] }) }
