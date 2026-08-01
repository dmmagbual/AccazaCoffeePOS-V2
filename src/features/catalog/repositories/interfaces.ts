import type { CatalogProduct, MenuAvailability, ModifierGroup, PosMenuLayout, ProductCategory, ProductVariation } from '../domain'

export interface CatalogQuery { organizationId: string; branchId: string; search?: string; limit: number }
export interface CatalogRepository<T extends { id: string; organizationId: string }> { getById(id: string): Promise<T | null>; list(query: CatalogQuery): Promise<readonly T[]>; create(record: T): Promise<T>; update(id: string, changes: Partial<T>): Promise<void> }
export interface CatalogRepositories { categories: CatalogRepository<ProductCategory>; products: CatalogRepository<CatalogProduct>; variations: CatalogRepository<ProductVariation>; optionGroups: CatalogRepository<ModifierGroup>; availability: CatalogRepository<MenuAvailability>; layouts: CatalogRepository<PosMenuLayout> }
