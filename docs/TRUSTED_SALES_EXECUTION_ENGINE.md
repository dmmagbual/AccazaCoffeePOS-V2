# Trusted Sales Execution Engine

`completeSale` is a Firebase callable in `functions/src/index.ts`. It authenticates the caller, derives a trusted request context, validates organization/branch/employee/assignment/permission/open shift, resolves catalog/recipe/tax/payment data server-side, and executes `FirestoreTrustedSaleRepository` in one Firestore transaction.

The transaction uses the shared `@abp/inventory-consumption` engine and persists immutable sale/receipt/payment/tax/recipe/option/COGS evidence, stock movements, balances, shift totals, Finance journal where configured, loyalty earn/redemption where configured, audit, outbox, cashier summary, and organization-scoped idempotency evidence.

Emulator evidence is in `functions/tests`: request-context coverage, catalog, recipe, tax, payment, controlled-negative inventory, idempotency, rollback, immutable history, loyalty redemption, and client security/read scope.

## Current status

P4-002 and PILOT-002 are **OPEN**. P4-002H.1 aligns production checkout with
configured payment IDs, identifier-only cart lines, persisted idempotency
recovery (`getSaleAttempt`), and immutable receipt records. Remaining mandatory
work is browser interaction evidence, auditable stale-claim recovery/index/rules
closure, and executed UAT. See `docs/P4_002_CLOSURE_AUDIT.md` and
`docs/P4_002_REMAINING_WORK.md`.
