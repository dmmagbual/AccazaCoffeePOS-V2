# Complete Sale Pipeline

## Lifecycle and use-case boundary

`completeSale` is the only application use case that turns a validated POS cart into a completed order. React gathers input and renders results; it does not resolve recipes, calculate COGS, generate snapshots, or persist Firestore documents.

The flow is: validate cart and displayed prices; validate operational readiness; resolve the active effective recipe and modifiers; create immutable item snapshots; calculate tax, discount, payment and change; generate multi-store collision-resistant order and receipt identifiers; atomically persist the order, payments, and receipt; then return a success result. The POS clears its cart and payment state only after that result succeeds.

## Snapshots and payment consistency

Every completed item keeps product identifiers, SKU/barcode, price, quantity, allocated tax and discount, recipe/version identity, ingredients, modifiers, and estimated COGS at the sale timestamp. Electronic payments require a reference. The combined tender must cover the grand total; cash overpayment becomes change. Split tenders are represented by multiple payment entries.

## Persistence, recovery, and reporting

When Firebase is configured, a Firestore write batch writes the order, all payments, and the receipt together so a partial completed sale is avoided. When it is not configured, the explicitly separate local development ledger is used. A persistence failure returns a recoverable error and leaves the cart intact. The local dashboard aggregates only orders with `completed` status for today's revenue, count, average value, and recent transactions.

Duplicate submissions are guarded in both the payment UI and the use case. Full offline synchronization is intentionally deferred: a production implementation should enqueue an encrypted, idempotent sale payload locally and replay it with the generated sale ID once connectivity and permission are restored.

## Future operational hooks

Completed snapshots are the source for future branch inventory deductions, stock movements, and COGS/profit postings. Those side effects are intentionally not performed by this ticket.
