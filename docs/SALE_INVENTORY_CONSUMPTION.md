# Sale Inventory Consumption

The trusted sale transaction imports `consumeInventoryBatch` from `@abp/inventory-consumption` once per sale. It persists only shared-engine batch, balance, allocation, movement, reconciliation, and COGS results. P4-002 remains open for finance, loyalty, and final duplicate-effect coverage.
