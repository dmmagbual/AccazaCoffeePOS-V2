# Server Shift Totals

`ShiftTotalsRepository` creates a durable totals projection and an `appliedShiftSales/{shiftId}-{saleId}` marker in the same transaction. The marker prevents a retry from increasing transaction, payment, expected-cash, or COGS totals again. The trusted sale command will call this in P4-002C.1.
