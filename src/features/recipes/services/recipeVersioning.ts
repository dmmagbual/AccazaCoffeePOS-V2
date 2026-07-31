import type { Recipe, RecipeVersion, RecipeVersionDifference } from '../domain'
import { recipeVersionSchema } from '../types'
import { calculateRecipeCost } from './recipeCosting'

export function validateRecipeVersion(version: RecipeVersion): void {
  const parsed = recipeVersionSchema.safeParse(version)
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'Recipe version is invalid.')
  const totals = calculateRecipeCost(version.ingredients, version.yieldQuantity, version.wastePercentage)
  if (Math.abs(totals.totalCost - version.totalCost) > 0.000001) throw new Error('Recipe cost totals are out of date.')
}

export function createDraftVersion(recipe: Recipe, source: RecipeVersion, changeReason: string, authorId: string, now: Date = new Date()): RecipeVersion {
  if (source.status === 'archived') throw new Error('Archived versions cannot be used as a draft source.')
  const cost = calculateRecipeCost(source.ingredients, source.yieldQuantity, source.wastePercentage)
  return { ...source, ...cost, id: crypto.randomUUID(), recipeId: recipe.id, versionNumber: source.versionNumber + 1, status: 'draft', effectiveFrom: null, effectiveTo: null, changeReason, approvedBy: null, approvedAt: null, createdAt: now, createdBy: authorId }
}

export function publishRecipeVersion(recipe: Recipe, version: RecipeVersion, previousPublishedVersion: RecipeVersion | null, approverId: string, now: Date = new Date()): { recipe: Recipe; version: RecipeVersion; supersededVersion: RecipeVersion | null } {
  if (version.status !== 'draft') throw new Error('Only a draft version can be published.')
  validateRecipeVersion(version)
  const published = { ...version, status: 'published' as const, effectiveFrom: now, effectiveTo: null, approvedBy: approverId, approvedAt: now }
  const supersededVersion = previousPublishedVersion ? { ...previousPublishedVersion, status: 'superseded' as const, effectiveTo: now } : null
  return { recipe: { ...recipe, activeVersionId: published.id, status: 'active', updatedAt: now, updatedBy: approverId }, version: published, supersededVersion }
}

export function compareRecipeVersions(previous: RecipeVersion, next: RecipeVersion): RecipeVersionDifference {
  const previousLines = new Map(previous.ingredients.map((line) => [line.ingredientId, line]))
  const nextLines = new Map(next.ingredients.map((line) => [line.ingredientId, line]))
  const ids = new Set([...previousLines.keys(), ...nextLines.keys()])
  const ingredientChanges = [...ids].flatMap((id) => {
    const before = previousLines.get(id); const after = nextLines.get(id)
    if (!before && after) return [`Added ${after.ingredientNameSnapshot}`]
    if (before && !after) return [`Removed ${before.ingredientNameSnapshot}`]
    return before && after && (before.baseUnitQuantity !== after.baseUnitQuantity || before.baseUnitCostSnapshot !== after.baseUnitCostSnapshot) ? [`Changed ${after.ingredientNameSnapshot}`] : []
  })
  return { ingredientChanges, costDifference: next.totalCost - previous.totalCost }
}

export function duplicateRecipeAsDraft(sourceRecipe: Recipe, sourceVersion: RecipeVersion, authorId: string, now: Date = new Date()): { recipe: Recipe; version: RecipeVersion } {
  const recipeId = crypto.randomUUID()
  const versionId = crypto.randomUUID()
  const recipe: Recipe = { ...sourceRecipe, id: recipeId, name: `${sourceRecipe.name} copy`, activeVersionId: null, status: 'active', createdAt: now, updatedAt: now, createdBy: authorId, updatedBy: authorId }
  const version: RecipeVersion = { ...sourceVersion, id: versionId, recipeId, versionNumber: 1, status: 'draft', effectiveFrom: null, effectiveTo: null, approvedBy: null, approvedAt: null, changeReason: 'Duplicated from approved recipe.', createdAt: now, createdBy: authorId }
  return { recipe, version }
}
