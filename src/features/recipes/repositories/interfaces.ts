import type { Recipe, RecipeVersion } from '../domain'
export interface RecipeRepository { getById(id: string): Promise<Recipe | null>; list(organizationId: string): Promise<readonly Recipe[]>; create(recipe: Recipe): Promise<Recipe>; update(id: string, updates: Partial<Recipe>): Promise<void> }
export interface RecipeVersionRepository { list(recipeId: string): Promise<readonly RecipeVersion[]>; create(version: RecipeVersion): Promise<RecipeVersion>; update(recipeId: string, versionId: string, updates: Partial<RecipeVersion>): Promise<void> }
