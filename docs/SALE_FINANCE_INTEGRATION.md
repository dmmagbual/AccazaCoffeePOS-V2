# Sale Finance Integration

`SaleFinanceResolver` converts a committed, server-resolved sale snapshot to balanced posting instructions using configured payment, revenue, tax, COGS, and inventory accounts plus an open accounting period. `completeSale` persists a deterministic journal in the transaction when configuration is ready; disabled or incomplete configuration is recorded explicitly.
