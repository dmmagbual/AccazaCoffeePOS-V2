# Sale Loyalty Integration

`SaleLoyaltyResolver` returns customer/program snapshots and configured earn eligibility from trusted records. `completeSale` writes a deterministic earn transaction and balance update when configured; recoverable loyalty resolution failures persist a retry request. Redemption remains unimplemented.
