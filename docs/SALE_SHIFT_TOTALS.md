# Sale Shift Totals

`completeSale` applies one committed-sale projection through `ShiftTotalsRepository` and its deterministic `appliedShiftSales/{shiftId}-{saleId}` marker. Retry-safe payment category, expected-cash, confirmed COGS, and provisional COGS totals are persisted in the trusted transaction.
