# Trusted Sales UAT Script — Pending Execution

Status: **not executed**. This is the minimum UAT record required before PILOT-002 closure; emulator evidence does not substitute for an observed operational run.

| Role | Scenario | Expected evidence | Observed result / sign-off |
| --- | --- | --- | --- |
| Cashier | Cash and exact-change sale | One trusted receipt, payment, movement, shift total, audit/outbox, cashier summary. | Pending |
| Cashier | GCash/Card and split tender | Server-resolved payment labels, exact reconciliation, no account ID on receipt. | Pending |
| Cashier | Product variation and option | Server snapshots and correct receipt line details. | Pending |
| Cashier | Insufficient stock / controlled negative | Safe rejection or documented provisional/reconciliation evidence. | Pending |
| Cashier | Retry after timeout/refresh | Same idempotency key returns original receipt with no duplicate effects. | Pending — POS prerequisite incomplete |
| Cashier | Offline/authorization/closed shift | Friendly safe error, support correlation ID, cart retained. | Pending — POS prerequisite incomplete |
| Manager/Owner | Receipt reprint/history | Renderer uses server-owned immutable receipt evidence. | Pending — renderer missing |
| Finance | Configured tax/COGS journal | Balanced immutable journal tied to sale. | Pending |
| Loyalty | Earn and redemption | Exact once balance/transaction and receipt snapshot. | Pending |
| Security reviewer | Cross-scope reads and client writes | Rules outcome matches documented contract. | Pending |

Record environment, tester, timestamp, sale/receipt IDs, result, and approval for each row. Do not close a pilot from this document until all required rows have observed evidence.
