import type { Product } from '../../features/pos/domain'
import { localOperationalIntegration } from './local'

export interface ProductOperationalStatusView { product: Product; linkedRecipe: string; activeVersion: string; ingredientCount: number; estimatedCogs: number; grossMargin: number; ready: boolean; messages: readonly string[] }
export function buildLocalProductOperationalStatus(product: Product): ProductOperationalStatusView {
  const resolution = localOperationalIntegration.resolveProductRecipe(product.id, '', new Date())
  const readiness = localOperationalIntegration.validateProductOperationalReadiness(product.id)
  const version = resolution.version?.version
  const estimatedCogs = version?.costPerServing ?? 0
  return { product, linkedRecipe: resolution.recipe?.name ?? (resolution.product.recipeRequired ? 'Not linked' : 'Not required'), activeVersion: version ? `v${version.versionNumber}` : '—', ingredientCount: version?.ingredients.length ?? 0, estimatedCogs, grossMargin: product.pricing.sellingPrice - estimatedCogs, ready: readiness.ready, messages: readiness.errors.map((item) => item.message) }
}
