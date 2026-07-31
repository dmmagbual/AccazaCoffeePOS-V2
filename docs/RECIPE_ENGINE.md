# Recipe Engine

## Central governance and franchise controls

Recipes are organization-owned Head Office standards. Branches and franchisees can read the approved version used for preparation but cannot create, publish, or override recipes. Firestore rules require the `recipes.manage` permission for draft work and `recipes.publish` to move a draft into published status. Recipes and versions are archived rather than deleted.

## Version lifecycle

Recipes keep a stable parent record and store immutable version documents beneath it. Published versions cannot be edited. Editing an approved recipe creates a new draft version; publishing it marks the prior published version as superseded and updates the recipe's `activeVersionId`. Only a single version is active. Sales should persist the recipe and version IDs used so later changes never alter historical order costing or preparation records.

The shared order-item model provides optional `recipeId` and `recipeVersionId` fields for that immutable sale-time reference. POS persistence can populate them when recipe-backed ordering is connected.

## Costing and waste

Recipe ingredient lines snapshot the Ingredient Master name and base-unit cost. The service converts a compatible recipe quantity to the ingredient base unit, calculates every line cost, adds a configured waste percentage, and divides by yield to derive cost per serving. There is no duplicated cost formula in React. Count-unit conversions are restricted to the configured base unit to avoid assumptions about packaging.

## Modifiers and future inventory

Modifier groups hold options such as extra espresso shots, syrups, whipped cream, tapioca pearls, and future milk substitutions. Each option stores a selling-price adjustment, recipe ingredient usage, its calculated incremental cost, availability, display order, and inventory-deduction readiness. This ticket does not deduct inventory. A later inventory workflow will consume the approved recipe version and selected modifier ingredient usage at sale time.
