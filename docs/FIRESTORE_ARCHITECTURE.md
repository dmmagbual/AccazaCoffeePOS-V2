# Firestore architecture

Top-level collections use `COLLECTIONS`: organizations, stores, users, roles, permissions, products, categories, modifiers, recipes, ingredients, inventoryItems, stockMovements, suppliers, purchaseOrders, customers, loyaltyAccounts, orders, orderItems, payments, receipts, shifts, cashDrawers, expenses, auditLogs, and appSettings.

Every operational document carries organization/store scope, audit timestamps and actors, and status. Queries must always constrain organizationId and storeId. Roles are assigned to users; permissions are evaluated from custom claims for rules enforcement.

Indexes cover store/date orders, status, catalog filtering, low-stock inventory, movement history, customer search, purchasing, and audit chronology. Audit records should be append-only; retain financial/audit records according to local tax policy and archive cold data outside active collections. Migrations are versioned, idempotent jobs that dual-read/dual-write before cutover. Use camelCase fields, plural collection names, and immutable createdAt/createdBy fields.

Firebase implementations remain behind repositories; React must use feature services/stores, never Firestore directly. Replace local catalog services incrementally with Firestore repositories after backfilling scoped documents.
