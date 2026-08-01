# Sale Inventory Consumption

The trusted sale transaction imports `consumeInventoryBatch` from `@abp/inventory-consumption` once per sale. It persists only shared-engine batch, balance, allocation, movement, reconciliation, and COGS results. `functions/tests/controlled-negative-inventory.test.mjs` proves prohibited-negative rollback, partial positive/negative allocation, FIFO exhaustion, reconciliation exposure, provisional/confirmed COGS, and duplicate retry behavior.

Finance, loyalty, and duplicate-effect transaction coverage are now present. P4-002 remains open for the separate POS/recovery/rules/index/UAT closure scope.
