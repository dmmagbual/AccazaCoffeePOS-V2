import type { ProductionBatch, ProductionOrder, ProductionRecipe, ProductionRecipeVersion } from '../domain'
export interface ProductionRepository<T extends { id: string }> { list(organizationId: string, storeId?: string): Promise<readonly T[]>; create(document: T): Promise<T>; update(id: string, updates: Partial<Omit<T, 'id'>>): Promise<void> }
export interface ProductionRepositories { recipes: ProductionRepository<ProductionRecipe>; recipeVersions: ProductionRepository<ProductionRecipeVersion>; orders: ProductionRepository<ProductionOrder>; batches: ProductionRepository<ProductionBatch> }
