# Sale Idempotency

The sale command stores the request hash, status, lease expiry, and result snapshot under the organization-scoped key. A completed matching retry returns its original result; a changed request using the same key is rejected. An expired `CLAIMED` lease is reclaimable by the same transaction path. `functions/tests/sale-rollback.test.mjs` proves expiry reclaim; `functions/tests/callable-idempotency.test.mjs` proves same-request replay and conflict rejection.

P4-002 remains open for execution-owner, recovery-audit, retention/cleanup, and live-claim-contention evidence.
