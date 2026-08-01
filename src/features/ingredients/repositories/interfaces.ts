import type { Ingredient, IngredientCategory, IngredientMaster } from '../domain'

/** Ingredient records are organization-owned; branches consume them through inventory records. */
export interface IngredientRepository {
  getById(id: string): Promise<Ingredient | null>
  list(organizationId: string): Promise<readonly Ingredient[]>
  create(ingredient: Ingredient): Promise<Ingredient>
  update(id: string, updates: Partial<Ingredient>): Promise<void>
}
export interface IngredientMasterRepository { getByCode(organizationId: string, ingredientCode: string): Promise<IngredientMaster | null>; list(organizationId: string): Promise<readonly IngredientMaster[]>; create(ingredient: IngredientMaster): Promise<IngredientMaster>; update(id: string, updates: Partial<IngredientMaster>): Promise<void> }
export interface IngredientCategoryRepository { list(organizationId: string): Promise<readonly IngredientCategory[]>; create(category: IngredientCategory): Promise<IngredientCategory>; update(id: string, updates: Partial<IngredientCategory>): Promise<void> }
