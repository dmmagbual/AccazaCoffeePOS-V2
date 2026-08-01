# P4-002 Remaining Work

This plan is deliberately limited to the smallest ordered closure milestones identified by `P4_002_CLOSURE_AUDIT.md`. It does not add unrelated modules.

## E1 — Authoritative sale-input completion

Close resolver and authorization evidence gaps before expanding sale effects.

1. Parse and enforce franchise/head-office scope in `functions/src/shared/requestContext.ts` and server authorization.
2. Add callable emulator fixtures/tests for variations, assigned option groups/items, required/min/max selections, option ingredient effects, published/draft/expired recipes, and tax precedence/effective dates.
3. Validate payment currencies, inactive/branch-restricted methods, digital wallets, and split payments server-side.

Acceptance: server ignores/rejects client authority; all variants are proven through the real callable.

## E2 — Inventory and COGS closure

1. Add callable emulator tests for FIFO across multiple batches.
2. Add allowed-negative and prohibited-negative tests, including no partial effects on rejection.
3. Assert allocation, movement, balance, reconciliation exposure, confirmed COGS, provisional COGS, estimated COGS, and status persistence.

Acceptance: inventory/COGS outcomes are atomic, historically persisted, and duplicate-safe for positive, negative, and mixed cases.

## E3 — Finance, loyalty, shift, and idempotency closure

1. Add configured-finance callable scenarios for balanced journal, tax payable, COGS/inventory, disabled/not-configured states, and retry safety.
2. Add callable loyalty-earn scenarios with customer eligibility and duplicate safety; implement redemption only if required for pilot and then test reservation, application, and retry.
3. Add two-sale/split-payment shift totals tests.
4. Implement and test stale `CLAIMED` lease recovery with execution owner, audit record, and no duplicate effects.

Acceptance: all configured effects are durable and exactly once; unsupported configuration yields explicit status.

## E4 — Failure, historical, POS, and operational proof

1. Inject inventory, receipt, shift, journal/outbox, and Firestore conflict failures; prove no partial successful sale appears.
2. Change product name/price, recipe version, tax rate, and option price after a sale; prove historical sale/receipt/finance evidence is unchanged.
3. Add POS tests for minimal callable input, stable idempotency keys, double-submit protection, cart preservation, success-only cart clearing, support correlation IDs, and no legacy fallback.
4. Add missing trusted-collection indexes and query tests; update UAT documents from executed evidence only.

Acceptance: all critical P4-002 emulator tests pass and docs/UAT accurately record them.

## Closure rule

Only after E1 through E4 pass in the emulator may `P4-002` and `PILOT-002` be marked complete. `PILOT-003` remains open until the tax snapshot historical/finance evidence in E1 and E4 passes.

## P4-002G update

The historical master-data mutation path is verified. Remaining snapshot work is a safe explicit legacy/incomplete read state for malformed or missing persisted snapshots, plus independent historical view coverage; live master data must never be substituted.
