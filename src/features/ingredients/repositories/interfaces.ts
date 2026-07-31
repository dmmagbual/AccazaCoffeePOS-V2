import type { Ingredient } from '../domain'

/** Ingredient records are organization-owned; branches consume them through inventory records. */
export interface IngredientRepository {
  getById(id: string): Promise<Ingredient | null>
  list(organizationId: string): Promise<readonly Ingredient[]>
  create(ingredient: Ingredient): Promise<Ingredient>
  update(id: string, updates: Partial<Ingredient>): Promise<void>
}
