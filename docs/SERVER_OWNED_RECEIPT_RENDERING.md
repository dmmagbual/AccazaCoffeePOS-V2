# Server-Owned Receipt Rendering

`completeSale` returns committed identifiers and totals. The POS then loads
`receipts/{saleId}` through `src/application/sales/trustedReceiptClient.ts` and
maps only the immutable, customer-safe receipt snapshot: line labels,
variations/options, quantities, totals, tax, committed payment labels, tender,
change, and receipt number.

The client does not rebuild final receipts from cart prices, live product/tax/
recipe master data, payment configuration, or client tax calculation. It also
does not map COGS, inventory costs, journal/account IDs, audit fields, loyalty
balances, or outbox data. Reprint must load this same receipt document.

The legacy local receipt service remains isolated for compatibility utilities;
it is not imported by the production checkout path.
