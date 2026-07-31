# Operational Integration Layer

## End-to-end flow

The application service resolves a POS product through its operational profile to a centrally controlled recipe, active published version, versioned ingredient rows, and central Ingredient Master records. The resulting snapshot is ready for future store inventory, stock movements, COGS posting, and profit reporting. No automatic stock deduction occurs in this release.

## Recipe resolution and effective dates

Products that require recipes must have a linked, non-archived recipe with an active `published` version. The version must be effective on the sale date: `effectiveFrom` cannot be in the future and `effectiveTo` cannot have elapsed. Store IDs are accepted by the resolution API for future inventory scope, but no branch-level recipe override path exists.

## Immutable historical snapshots

At order completion, `buildOrderItemRecipeSnapshot` captures product identity and price, recipe/version identity, ingredient name/cost/quantity snapshots, selected modifier snapshots, and estimated COGS at the sale timestamp. `OrderItemDocument.operationalSnapshot` is reserved for that immutable data. Reports must use this snapshot rather than current recipe or ingredient data.

## Modifiers, readiness, and future operations

Selected modifier options contribute their selling-price adjustment and snapshot ingredient usage/cost. The service marks whether each option is ready for future inventory deduction, but does not perform it. Readiness reports blocking issues for missing recipes or ingredients, invalid units, inactive products, unavailable modifiers, zero ingredient cost, and ineffective recipe versions. Packaged retail products may intentionally omit recipes.

## Governance and future posting

Recipes remain Head Office controlled through `recipes.manage` and `recipes.publish` permissions; franchise and branch users consume approved versions only. A future checkout completion workflow should persist snapshots, create store-specific stock movements, post COGS from snapshot values, and derive gross-profit reporting without rereading mutable master data.
