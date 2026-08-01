# P4-002 Remaining Closure Work

This is the minimum ordered scope from the final closure audit on 2026-08-02. It deliberately does not reopen already emulator-verified server catalog, recipe, tax, payment, inventory, Finance, loyalty, or rollback work.

## P4-002H.2 — Production POS interaction evidence

P4-002H.1 is complete in source and unit evidence: configured payment IDs,
identifier-only variation/options, persisted key recovery, a minimal recovery
callable, and server-owned receipt rendering are now in the production path.

1. Add rendered component or browser E2E tests for double click, Enter twice,
   refresh, offline, timeout, retry, cart preservation, and success-only
   clearing.
2. Run those flows against an authenticated emulator-backed configured sale.

Acceptance: production checkout interaction behavior is observed in a browser,
not only covered by source/unit tests.

## P4-002K — Operational security and recovery closure

1. Add client-SDK write-denial coverage for every actual server-owned trusted collection, including `loyaltyBalances`.
2. Complete the Firestore index matrix for documented sales, receipts, idempotency lease recovery, movements, shift totals, finance, loyalty, and outbox queries; document every purpose and test representative queries.
3. Add idempotency execution owner, recovery audit evidence, and retention/cleanup rules; test active-claim contention as well as expired reclaim.

Acceptance: trusted evidence cannot be forged, required operational queries are indexed, and stale recovery is auditable as well as transaction-safe.

## P4-003 — Tax lifecycle pilot closure

1. Add a mixed-tax sale with discount allocation evidence.
2. Implement and test the refund/reversal tax-snapshot foundation required by the tax pilot definition.
3. Record the canonical embedded tax snapshot contract in `docs/SALE_TAX_SNAPSHOTS.md`.

Acceptance: rates, allocations, receipt/finance evidence, and reversals remain historically immutable.

## P4-002L — Operational UAT and release evidence

1. Replace the one-paragraph UAT note with role, input, expected-result, observed-result, and sign-off fields.
2. Execute UAT against the approved environment after H.2 and K pass.
3. Add the dated runtime `npm audit --omit=dev` result to dependency documentation.
4. Restore/author the missing `MASTER_PLAN.md` and `BUSINESS_RULE_BOOK.md` references or update the document inventory deliberately.

## Closure rule

Only after P4-002H.2, P4-002K, and P4-002L have passing evidence may P4-002 and PILOT-002 close. PILOT-003 additionally requires P4-003.
