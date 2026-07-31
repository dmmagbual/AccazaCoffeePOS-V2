# Shift Management

Store Operations owns the daily branch workflow: select a persisted branch context, open one cashier shift with opening cash, accept sales, reconcile actual cash, and close with a variance and report. Shifts are organization/store scoped and the service prevents a cashier from opening a second active shift.

The close report derives sales, payment channels, transactions, top products, and duration from completed orders in the shift window. Expected cash is opening cash plus cash sales less refunds. Cashiers may close their own shift; the service accepts an explicit manager authority flag for closing another cashier’s shift. Firebase repository support is provided for production persistence; local persisted state is used when Firebase is unavailable.

Future work: supply authenticated cashier/role context, wire manager authority to Firebase claims, persist/report refund transactions, and use the active shift ID automatically in every completed sale.
