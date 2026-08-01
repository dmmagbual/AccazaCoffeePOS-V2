# Sale Security

The callable resolves catalog, tax, payment, employee, and branch data server-side. Firestore rules deny client writes to sale evidence, inventory movements, journals, loyalty balances and transactions, shift totals, audit records, outbox records, and `cashierSaleSummaries`. Cashiers use branch-scoped receipts and server-owned sale summaries; mixed `orders` documents contain COGS and internal links that Rules cannot field-filter. Journals additionally require `finance.read`.
