# Sale Loyalty Integration

`SaleLoyaltyResolver` returns customer/program snapshots and configured earn eligibility from trusted records. `completeSale` writes a deterministic earn transaction and balance update when configured; recoverable loyalty resolution failures persist a retry request. Redemption remains unimplemented.

P4-002G verifies the committed loyalty transaction remains unchanged after customer display/tier and loyalty earn-policy changes. Redemption remains unimplemented.
