# Ingredient Master

## Central governance

Ingredients are organization-owned Head Office records. Branches and franchise locations may reference an approved ingredient through future inventory, recipe, purchasing, and product-add-on records, but do not create alternative central definitions. This prevents conflicting names, units, costs, and allergens across stores.

Firestore rules scope reads to the organization and restrict create/update to principals with the `ingredients.manage` custom claim permission. Ingredients are archived instead of deleted.

## Multi-branch and franchise strategy

`ingredients` records have an `organizationId` and intentionally have no `storeId`. A future `inventoryItems` record will link an ingredient to a specific store and hold the store-level quantity, reorder state, and stock history. This preserves a single central master while allowing unlimited branches.

## Units and conversions

Each ingredient identifies a base unit for recipes, inventory costing, and future deductions, plus a purchasing unit for supplier orders. Weight conversions use the Master Data factors (kilogram/gram/ounce); volume conversions use liter/milliliter. Count-unit packaging conversions such as pack-to-piece require an explicit positive conversion. A count purchasing unit can convert to a volume base unit only with an explicit packaging capacity (for example, a 750 ml bottle). Weight and volume are never implicitly convertible, and neither are count and weight.

## Costing and suppliers

The cost per base unit is calculated in the service layer as `latestPurchaseCost / purchasingToBaseUnitConversion`, rounded to six decimal places. React components only display this value. The preferred supplier is optional and references a future supplier master record; it does not duplicate supplier attributes.

## Allergens, archival, and inventory

Allergens are controlled values stored on the master record so recipes and products can later aggregate disclosures. Archiving preserves historical recipe, purchase, and cost references while preventing future use. Ingredient inventory tracking settings are preparation for store-level inventory only; this ticket does not create stock movements or automatic recipe deductions.
