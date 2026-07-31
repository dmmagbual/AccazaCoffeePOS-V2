import type { Ingredient, IngredientCategoryOption, IngredientUnit, SupplierOption } from '../domain'
import { withCalculatedBaseUnitCost } from '../services'

export const localIngredientCategories: readonly IngredientCategoryOption[] = [
  { id: 'beans', name: 'Coffee & Tea' }, { id: 'dairy', name: 'Dairy & Chilled' }, { id: 'syrups', name: 'Syrups & Sauces' }, { id: 'packaging', name: 'Packaging' }, { id: 'toppings', name: 'Toppings' },
]
export const localIngredientSuppliers: readonly SupplierOption[] = [{ id: 'supplier-roastery', name: 'Accaza Roastery' }, { id: 'supplier-dairy', name: 'Fresh Fields Dairy' }, { id: 'supplier-packaging', name: 'Pacific Packaging' }]
export const localIngredientUnits: readonly IngredientUnit[] = [
  { id: 'gram', name: 'Gram', symbol: 'g', dimension: 'weight', baseFactor: 1 }, { id: 'kilogram', name: 'Kilogram', symbol: 'kg', dimension: 'weight', baseFactor: 1000 }, { id: 'ounce', name: 'Ounce', symbol: 'oz', dimension: 'weight', baseFactor: 28.349523125 },
  { id: 'milliliter', name: 'Milliliter', symbol: 'ml', dimension: 'volume', baseFactor: 1 }, { id: 'liter', name: 'Liter', symbol: 'l', dimension: 'volume', baseFactor: 1000 },
  { id: 'piece', name: 'Piece', symbol: 'pc', dimension: 'count', baseFactor: 1 }, { id: 'bottle', name: 'Bottle', symbol: 'btl', dimension: 'count', baseFactor: 1 }, { id: 'pack', name: 'Pack', symbol: 'pack', dimension: 'count', baseFactor: 1 }, { id: 'scoop', name: 'Scoop', symbol: 'scoop', dimension: 'count', baseFactor: 1 }, { id: 'shot', name: 'Shot', symbol: 'shot', dimension: 'count', baseFactor: 1 }, { id: 'serving', name: 'Serving', symbol: 'srv', dimension: 'count', baseFactor: 1 },
]

function seed(id: string, name: string, overrides: Partial<Ingredient>): Ingredient {
  const timestamp = new Date()
  return withCalculatedBaseUnitCost({ id, organizationId: 'local-accaza', name, description: '', ingredientCategoryId: 'beans', baseUnitId: 'gram', purchasingUnitId: 'kilogram', purchasingToBaseUnitConversion: 1000, sku: '', barcode: '', brand: '', preferredSupplierId: 'supplier-roastery', latestPurchaseCost: 0, baseUnitCost: 0, trackInventory: true, minimumStockLevel: 100, reorderQuantity: 500, shelfLifeDays: 180, storageInstructions: '', allergens: ['none'], status: 'active', createdAt: timestamp, updatedAt: timestamp, createdBy: 'local-admin', updatedBy: 'local-admin', ...overrides })
}

export function createLocalIngredientDraft(): Ingredient {
  return seed(crypto.randomUUID(), '', { description: '', sku: '', barcode: '', brand: '', latestPurchaseCost: 0, minimumStockLevel: 1, reorderQuantity: 1, shelfLifeDays: null, storageInstructions: '', allergens: ['none'] })
}

export const localIngredients: readonly Ingredient[] = [
  seed('ingredient-coffee-beans', 'Medium Roast Coffee Beans', { description: 'House medium roast espresso blend.', brand: 'Accaza Roastery', latestPurchaseCost: 900, storageInstructions: 'Keep sealed in a cool, dry place.' }),
  seed('ingredient-fresh-milk', 'Fresh Milk', { description: 'Pasteurized whole milk.', ingredientCategoryId: 'dairy', baseUnitId: 'milliliter', purchasingUnitId: 'liter', purchasingToBaseUnitConversion: 1000, brand: 'Fresh Fields', preferredSupplierId: 'supplier-dairy', latestPurchaseCost: 105, minimumStockLevel: 3000, reorderQuantity: 12000, shelfLifeDays: 10, storageInstructions: 'Refrigerate at 1–4°C.', allergens: ['milk'] }),
  seed('ingredient-vanilla-syrup', 'Vanilla Syrup', { ingredientCategoryId: 'syrups', baseUnitId: 'milliliter', purchasingUnitId: 'bottle', purchasingToBaseUnitConversion: 750, brand: 'Monin', latestPurchaseCost: 420, shelfLifeDays: 365, storageInstructions: 'Store in a cool, dry place.' }),
  seed('ingredient-caramel-syrup', 'Caramel Syrup', { ingredientCategoryId: 'syrups', baseUnitId: 'milliliter', purchasingUnitId: 'bottle', purchasingToBaseUnitConversion: 750, brand: 'Monin', latestPurchaseCost: 420, shelfLifeDays: 365, storageInstructions: 'Store in a cool, dry place.' }),
  seed('ingredient-chocolate-sauce', 'Chocolate Sauce', { ingredientCategoryId: 'syrups', baseUnitId: 'milliliter', purchasingUnitId: 'bottle', purchasingToBaseUnitConversion: 2000, brand: 'Hershey\'s', latestPurchaseCost: 620, allergens: ['milk', 'soy'], storageInstructions: 'Store in a cool, dry place.' }),
  seed('ingredient-whipped-cream', 'Whipped Cream', { ingredientCategoryId: 'dairy', baseUnitId: 'milliliter', purchasingUnitId: 'bottle', purchasingToBaseUnitConversion: 250, brand: 'Fresh Fields', preferredSupplierId: 'supplier-dairy', latestPurchaseCost: 165, allergens: ['milk'], shelfLifeDays: 14, storageInstructions: 'Refrigerate at 1–4°C.' }),
  seed('ingredient-cup-12oz', '12 oz Cup', { ingredientCategoryId: 'packaging', baseUnitId: 'piece', purchasingUnitId: 'pack', purchasingToBaseUnitConversion: 50, brand: 'Pacific Packaging', preferredSupplierId: 'supplier-packaging', latestPurchaseCost: 280, minimumStockLevel: 100, reorderQuantity: 500, shelfLifeDays: null, storageInstructions: 'Keep dry and clean.' }),
  seed('ingredient-cup-lid', 'Cup Lid', { ingredientCategoryId: 'packaging', baseUnitId: 'piece', purchasingUnitId: 'pack', purchasingToBaseUnitConversion: 50, brand: 'Pacific Packaging', preferredSupplierId: 'supplier-packaging', latestPurchaseCost: 190, minimumStockLevel: 100, reorderQuantity: 500, shelfLifeDays: null, storageInstructions: 'Keep dry and clean.' }),
  seed('ingredient-tapioca', 'Tapioca Pearls', { ingredientCategoryId: 'toppings', baseUnitId: 'gram', purchasingUnitId: 'kilogram', purchasingToBaseUnitConversion: 1000, latestPurchaseCost: 310, shelfLifeDays: 365, storageInstructions: 'Keep sealed in a cool, dry place.' }),
]
