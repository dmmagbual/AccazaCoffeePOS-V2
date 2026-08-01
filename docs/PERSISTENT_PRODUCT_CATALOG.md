# Persistent Product Catalog

P4-001 introduces the typed repository boundary and branch-aware POS read-model service for catalog records. Production POS no longer imports `products.json`; it starts in an explicit empty/setup state until a repository-backed catalog is available. The legacy JSON file is retained only as a migration or test fixture.

The intended collections are `productCategories`, `products`, `productVariations`, `optionGroups`, `optionItems`, `productOptionAssignments`, `productAvailability`, and `posMenuLayouts`. Read-model filtering excludes inactive categories/products/variations/options and branch-unavailable products. The model resolves a branch layout and returns recipe-readiness warnings without client-side Firestore access.

This foundation does **not** close PILOT-001 yet: audited trusted write commands, persistent Settings editors, Firebase read wiring, and POS conversion from catalog records to the legacy cart product type remain required.
