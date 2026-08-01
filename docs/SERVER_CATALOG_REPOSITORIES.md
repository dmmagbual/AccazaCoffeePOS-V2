# Server Catalog Repositories

The Functions-only catalog repositories read `productCategories`, `products`, `productVariations`, `optionGroups`, `optionItems`, `productOptionAssignments`, and `productAvailability` through the Admin SDK. They enforce organization scope, branch availability, active and effective status, and return immutable sale snapshots. Browser code cannot import these modules.
