# Sale Loyalty Integration

`SaleLoyaltyResolver` returns customer/program snapshots and configured earn/redemption eligibility from trusted records. `completeSale` writes deterministic `EARN` and, when requested and configured, `REDEEM` transactions and balance updates in its trusted transaction. Invalid redemption conditions reject before sale effects; ordinary non-critical earning failures retain a durable retry request.

`functions/tests/loyalty-redemption.test.mjs` verifies a real callable redemption, insufficient-points/inactive/expired/wrong-organization denials, duplicate-safe replay, changed-request conflict, and immutable receipt/sale redemption evidence. `functions/tests/historical-snapshots.test.mjs` verifies immutable EARN evidence after live master-data changes. A master-data mutation test specifically for redeemed history remains non-blocking hardening.
