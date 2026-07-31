import { localIngredients, localIngredientUnits } from '../../features/ingredients/data/localIngredients'
import { localRecipeRecords } from '../../features/recipes/data/localRecipes'
import type { ProductOperationalProfile } from './contracts'
import { createOperationalIntegrationService } from './service'

const recipeLinks: Readonly<Record<string, string>> = { americano: 'recipe-americano', cappuccino: 'recipe-cappuccino' }
export const localProductOperationalProfiles: readonly ProductOperationalProfile[] = [
  { productId: 'espresso', productName: 'Espresso', productPrice: 120, categoryName: 'Coffee', recipeRequired: true, linkedRecipeId: null, productStatus: 'active' },
  { productId: 'flat-white', productName: 'Flat White', productPrice: 165, categoryName: 'Coffee', recipeRequired: true, linkedRecipeId: null, productStatus: 'active' },
  { productId: 'iced-latte', productName: 'Iced Latte', productPrice: 175, categoryName: 'Coffee', recipeRequired: true, linkedRecipeId: null, productStatus: 'active' },
  { productId: 'matcha-latte', productName: 'Matcha Latte', productPrice: 185, categoryName: 'Tea', recipeRequired: true, linkedRecipeId: null, productStatus: 'active' },
  { productId: 'americano', productName: 'Americano', productPrice: 140, categoryName: 'Coffee', recipeRequired: true, linkedRecipeId: recipeLinks.americano ?? null, productStatus: 'active' },
  { productId: 'cappuccino', productName: 'Cappuccino', productPrice: 170, categoryName: 'Coffee', recipeRequired: true, linkedRecipeId: recipeLinks.cappuccino ?? null, productStatus: 'active' },
  { productId: 'chai-latte', productName: 'Chai Latte', productPrice: 180, categoryName: 'Tea', recipeRequired: true, linkedRecipeId: null, productStatus: 'active' },
  { productId: 'butter-croissant', productName: 'Butter Croissant', productPrice: 95, categoryName: 'Pastry', recipeRequired: false, linkedRecipeId: null, productStatus: 'active' },
  { productId: 'house-blend-beans', productName: 'House Blend Beans', productPrice: 480, categoryName: 'Retail', recipeRequired: false, linkedRecipeId: null, productStatus: 'active' },
]

export const localOperationalIntegration = createOperationalIntegrationService({ profiles: localProductOperationalProfiles, recipes: localRecipeRecords.map(({ recipe, versions }) => ({ recipe, versions })), ingredients: localIngredients, units: localIngredientUnits })
