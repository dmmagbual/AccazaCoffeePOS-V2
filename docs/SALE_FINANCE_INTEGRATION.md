# Sale Finance Integration

`SaleFinanceResolver` converts a committed, server-resolved sale snapshot to balanced posting instructions using configured payment, revenue, tax, COGS, and inventory accounts plus an open accounting period. P4-002C.0 deliberately does not invoke it from `completeSale`; P4-002C.1 will persist the resolved instruction or a durable posting request.
