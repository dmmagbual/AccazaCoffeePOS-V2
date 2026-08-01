# Trusted Sale Read Model

Trusted sales are stored in `orders`; immutable receipt rendering is stored in `receipts`; payment evidence is in `payments`; inventory evidence is in `stockMovements`; and trusted audit evidence is in `auditLogs`. There is no `taxSnapshots` collection: each order line embeds `taxSnapshot`, and receipt lines persist the tax amount needed for display. Product, category, variation, recipe, and option snapshots are embedded in `orders.lines` and receipt lines.

`orders` also contains COGS, Finance, Loyalty, and internal correlation fields. Firestore Rules cannot hide individual fields, so cashiers must not receive broad order documents solely for POS history. `cashierSaleSummaries` is the server-owned, deterministic `{saleId}` projection for own-branch/own-shift history; it contains only rendered line names, totals, embedded tax display values, and payment display summaries. Owners with `operations.read` may read scoped orders and receipts; journals require `finance.read`.

P4-002G verifies that completed idempotent replay uses persisted result evidence after trusted context checks, without resolving changed catalog, recipe, tax, or payment records.
