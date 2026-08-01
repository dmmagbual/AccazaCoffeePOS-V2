# Final P4-002 Trusted Sales Execution Engine Closure Audit

Audit date: 2026-08-02. This is an evidence audit, not an implementation milestone. `VERIFIED` requires source and directly relevant test evidence; a build or lint result alone is never behavioral evidence.

### Audit-run verification note

The current audit run passed root typecheck/lint/tests/build and Functions build/lint/tests. `npm run emulators:test` did **not** complete in this run because an already-running Firestore emulator owns port 8080. The standard command exited before tests; attempting Functions/Auth-only against that external Firestore was invalid because Firebase CLI supplied an invalid `FIRESTORE_EMULATOR_HOST`. The CE references in this matrix identify real emulator test files and prior executed evidence; they are not a claim that this audit-run command passed. Re-run the standard command after the existing emulator stops.

## Evidence legend

- **CE** — real Auth, Functions, and Firestore emulator test. The suite is `npm run emulators:test`.
- **FT** — Functions unit/static test (`npm run functions:test` outside an emulator).
- **RT** — root Vitest test.

Core implementation lives in `functions/src/index.ts`, `functions/src/sales/completeSale.ts`, `functions/src/sales/trustedSaleInputResolver.ts`, the server repositories beneath `functions/src`, and `packages/inventory-consumption/src/service.ts`.

## Executive decision

The server transaction is substantially evidenced, but **P4-002 remains OPEN**, **PILOT-002 remains OPEN**, and **PILOT-003 remains OPEN**. The open status is driven by production POS integration/receipt evidence, stale-claim operational recovery metadata, incomplete rules/index verification, UAT coverage, and stale/missing required documentation—not by an absence of tested server-side sale execution.

Evidence-weighted matrix: **66 VERIFIED, 15 PARTIAL, 2 MISSING** (79% of 84 rows). This percentage is informational only and is not a closure criterion.

`P4` / `P2` / `P3` in the last column means “blocks P4-002 / PILOT-002 / PILOT-003”.

## Final requirement matrix

| # | Requirement | Status | Exact source and test/emulator evidence | Remaining gap | Blocks |
| --- | --- | --- | --- | --- | --- |
| 1 | Secure callable entry point | VERIFIED | `functions/src/index.ts`; `functions/tests/emulator.test.mjs` CE | None for endpoint existence. | No / No / No |
| 2 | Authentication | VERIFIED | `functions/src/shared/requestContext.ts`; `functions/tests/foundation.test.mjs` FT, `request-context-coverage.test.mjs` CE | None. | No / No / No |
| 3 | Organization authorization | VERIFIED | `functions/src/authorization/branchAuthorizationRepository.ts`; `request-context-coverage.test.mjs` CE | None. | No / No / No |
| 4 | Branch authorization | VERIFIED | `branchAuthorizationRepository.ts`; `request-context-coverage.test.mjs` CE | None. | No / No / No |
| 5 | Employee validation | VERIFIED | `branchAuthorizationRepository.ts`; `request-context-coverage.test.mjs` CE | None. | No / No / No |
| 6 | Branch assignment | VERIFIED | `branchAuthorizationRepository.ts`; `request-context-coverage.test.mjs` CE | None. | No / No / No |
| 7 | POS permission | VERIFIED | `branchAuthorizationRepository.ts`, `shared/callableErrors.ts`; `request-context-coverage.test.mjs` CE | None. | No / No / No |
| 8 | Open-shift validation | VERIFIED | `index.ts`, `branchAuthorizationRepository.ts`, `sales/completeSale.ts`; `request-context-coverage.test.mjs` CE | None. | No / No / No |
| 9 | Head Office authorization | VERIFIED | `shared/requestContext.ts`, `branchAuthorizationRepository.ts`; `request-context-coverage.test.mjs`, `crossScopeReadClient.test.mjs` CE | Explicit authority is required; unscoped Head Office is denied. | No / No / No |
| 10 | Franchise isolation | VERIFIED | `shared/requestContext.ts`, `branchAuthorizationRepository.ts`, `firestore.rules`; `request-context-coverage.test.mjs`, `crossScopeReadClient.test.mjs` CE | None for tested claim/read scopes. | No / No / No |
| 11 | Server-side product resolution | VERIFIED | `catalog/productRepository.ts`, `sales/trustedSaleInputResolver.ts`; `catalog-resolution.test.mjs` CE | None. | No / No / No |
| 12 | Variation resolution | VERIFIED | `catalog/variationRepository.ts`, `trustedSaleInputResolver.ts`; `catalog-resolution.test.mjs` CE | None. | No / No / No |
| 13 | Option/add-on resolution | VERIFIED | `catalog/optionGroupRepository.ts`, `optionItemRepository.ts`, `productOptionAssignmentRepository.ts`; `catalog-resolution.test.mjs` CE | None for selected-option validation and snapshots. | No / No / No |
| 14 | Published recipe resolution | VERIFIED | `recipes/recipeRepository.ts`, `trustedSaleInputResolver.ts`; `recipe-resolution.test.mjs` CE | None. | No / No / No |
| 15 | Recipe lifecycle handling | VERIFIED | `recipes/recipeRepository.ts`; `recipe-resolution.test.mjs` CE covers missing, draft, archived, deleted, wrong-product, and multiple-published cases. | None. | No / No / No |
| 16 | Effective tax resolution | VERIFIED | `tax/taxRepository.ts`, `tax/taxResolver.ts`; `tax-resolution.test.mjs` CE | None. | No / No / No |
| 17 | Tax precedence | VERIFIED | `tax/taxResolver.ts`; `tax-resolution.test.mjs` CE covers branch, category, product, variation, and option precedence. | None. | No / No / No |
| 18 | Tax effective dates | VERIFIED | `tax/taxRepository.ts`, `tax/taxResolver.ts`; `tax-resolution.test.mjs` CE | None. | No / No / No |
| 19 | Tax snapshot persistence | VERIFIED | `sales/completeSale.ts` persists embedded `taxSnapshot` and `optionTaxSnapshots`; `tax-resolution.test.mjs`, `historical-snapshots.test.mjs` CE | There is intentionally no `taxSnapshots` collection. | No / No / No |
| 20 | Payment-method resolution | VERIFIED | `payments/paymentMethodRepository.ts`, `sales/completeSale.ts`; `payment-resolution.test.mjs` CE | None. | No / No / No |
| 21 | Cash validation | VERIFIED | `paymentMethodRepository.ts`, `completeSale.ts`; `payment-resolution.test.mjs` CE | None. | No / No / No |
| 22 | Split-payment validation | VERIFIED | `paymentMethodRepository.ts`, `completeSale.ts`; `payment-resolution.test.mjs` CE covers two- and three-method tenders. | None. | No / No / No |
| 23 | Payment snapshots | VERIFIED | `completeSale.ts`; `payment-resolution.test.mjs`, `historical-snapshots.test.mjs` CE | None. | No / No / No |
| 24 | Client-forgery resistance | VERIFIED | `trustedSaleInputResolver.ts`, `completeSale.ts`; `catalog-resolution.test.mjs`, `recipe-resolution.test.mjs`, `tax-resolution.test.mjs`, `payment-resolution.test.mjs` CE | None. | No / No / No |
| 25 | Durable idempotency | VERIFIED | `completeSale.ts`; `callable-idempotency.test.mjs`, `sale-rollback.test.mjs` CE | None. | No / No / No |
| 26 | Same-request replay | VERIFIED | `index.ts`, `completeSale.ts`; `callable-idempotency.test.mjs`, `historical-snapshots.test.mjs`, `loyalty-redemption.test.mjs` CE | None. | No / No / No |
| 27 | Changed-request conflict | VERIFIED | `completeSale.ts`, `shared/callableErrors.ts`; `callable-idempotency.test.mjs`, `loyalty-redemption.test.mjs` CE | None. | No / No / No |
| 28 | Stale-claim recovery | PARTIAL | `completeSale.ts` uses `leaseExpiresAt` and request hash; `sale-rollback.test.mjs` CE reclaims an expired claim. | No execution owner, recovery audit record, retention/cleanup policy, or live-claim contention test. | Yes / Yes / No |
| 29 | FIFO allocation | VERIFIED | `@abp/inventory-consumption`, `completeSale.ts`; `shared-inventory-package.test.mjs` FT, `controlled-negative-inventory.test.mjs` CE | Shared engine call and persisted consumption are proven; a dedicated multi-positive-batch callable case remains desirable hardening. | No / No / No |
| 30 | Controlled negative inventory | VERIFIED | `@abp/inventory-consumption`, `completeSale.ts`; `controlled-negative-inventory.test.mjs` CE | None for prohibited, partial negative, exhaustion, and retry paths. | No / No / No |
| 31 | `SALE_CONSUMPTION` movements | VERIFIED | `completeSale.ts`, inventory package; `controlled-negative-inventory.test.mjs`, `recipe-resolution.test.mjs` CE | None. | No / No / No |
| 32 | Inventory batch mutations | VERIFIED | `completeSale.ts`; `controlled-negative-inventory.test.mjs` CE | None. | No / No / No |
| 33 | Inventory balance/projection mutations | VERIFIED | `completeSale.ts`, inventory package; `controlled-negative-inventory.test.mjs`, `callable-idempotency.test.mjs` CE | None. | No / No / No |
| 34 | Reconciliation exposure | VERIFIED | inventory package, `completeSale.ts`; `controlled-negative-inventory.test.mjs` CE | None. | No / No / No |
| 35 | Confirmed COGS | VERIFIED | inventory package, `completeSale.ts`; `recipe-resolution.test.mjs`, `controlled-negative-inventory.test.mjs` CE | None. | No / No / No |
| 36 | Provisional COGS | VERIFIED | inventory package, `completeSale.ts`; `controlled-negative-inventory.test.mjs` CE | None. | No / No / No |
| 37 | COGS status | VERIFIED | inventory package, `completeSale.ts`; `controlled-negative-inventory.test.mjs` CE | None. | No / No / No |
| 38 | Product snapshot | VERIFIED | `catalog/productRepository.ts`, `completeSale.ts`; `catalog-resolution.test.mjs`, `historical-snapshots.test.mjs` CE | None. | No / No / No |
| 39 | Variation snapshot | VERIFIED | `variationRepository.ts`, `completeSale.ts`; `catalog-resolution.test.mjs`, `historical-snapshots.test.mjs` CE | None. | No / No / No |
| 40 | Option snapshot | VERIFIED | option repositories, `completeSale.ts`; `catalog-resolution.test.mjs`, `historical-snapshots.test.mjs` CE | None. | No / No / No |
| 41 | Recipe-version snapshot | VERIFIED | `recipeRepository.ts`, `completeSale.ts`; `recipe-resolution.test.mjs`, `historical-snapshots.test.mjs` CE | None. | No / No / No |
| 42 | Receipt snapshot | VERIFIED | `completeSale.ts`; `callable-idempotency.test.mjs`, `historical-snapshots.test.mjs` CE | None. | No / No / No |
| 43 | Cashier-summary projection | VERIFIED | `completeSale.ts`, `firestore.rules`; `callable-idempotency.test.mjs`, `scopedReadClient.test.mjs` CE | None. | No / No / No |
| 44 | Shift totals | VERIFIED | `shifts/shiftTotalsRepository.ts`, `completeSale.ts`; `emulator.test.mjs`, `callable-idempotency.test.mjs`, `sale-rollback.test.mjs` CE | None for transaction idempotency. | No / No / No |
| 45 | Finance posting | VERIFIED | `finance/saleFinanceResolver.ts`, `journalRepository.ts`, `completeSale.ts`; `finance-loyalty-boundary.test.mjs` FT, `historical-snapshots.test.mjs`, `sale-rollback.test.mjs` CE | None for synchronous configured journal path. | No / No / No |
| 46 | Finance idempotency | VERIFIED | `journalRepository.ts`, `completeSale.ts`; `sale-rollback.test.mjs`, `historical-snapshots.test.mjs` CE | Deterministic sale journal ID is proven across retry. | No / No / No |
| 47 | Loyalty earn | VERIFIED | `loyalty/saleLoyaltyResolver.ts`, `loyaltyTransactionRepository.ts`, `completeSale.ts`; `historical-snapshots.test.mjs`, `sale-rollback.test.mjs` CE | None. | No / No / No |
| 48 | Loyalty redemption | VERIFIED | `saleLoyaltyResolver.ts`, `loyaltyBalanceRepository.ts`, `loyaltyTransactionRepository.ts`, `completeSale.ts`; `loyalty-redemption.test.mjs` CE | None for configured redemption conditions. | No / No / No |
| 49 | Loyalty idempotency | VERIFIED | `loyaltyTransactionRepository.ts`, `completeSale.ts`; `loyalty-redemption.test.mjs`, `sale-rollback.test.mjs` CE | None. | No / No / No |
| 50 | Audit record | VERIFIED | `completeSale.ts`; `callable-idempotency.test.mjs`, `sale-rollback.test.mjs` CE | None. | No / No / No |
| 51 | Outbox events | VERIFIED | `completeSale.ts`; `callable-idempotency.test.mjs`, `sale-rollback.test.mjs` CE | None for durable `SaleCompleted` event. | No / No / No |
| 52 | Transaction rollback | VERIFIED | `completeSale.ts`; `sale-rollback.test.mjs` CE injects all 14 persistence stages. | None. | No / No / No |
| 53 | Retry after failure | VERIFIED | `completeSale.ts`; `sale-rollback.test.mjs` CE | None. | No / No / No |
| 54 | No partial sale | VERIFIED | Firestore transaction in `completeSale.ts`; `sale-rollback.test.mjs`, `controlled-negative-inventory.test.mjs` CE | None for injected stages. | No / No / No |
| 55 | Historical product immutability | VERIFIED | `completeSale.ts`; `historical-snapshots.test.mjs` CE | None. | No / No / No |
| 56 | Historical variation immutability | VERIFIED | `completeSale.ts`; `historical-snapshots.test.mjs` CE | None. | No / No / No |
| 57 | Historical option immutability | VERIFIED | `completeSale.ts`; `historical-snapshots.test.mjs` CE | None. | No / No / No |
| 58 | Historical recipe immutability | VERIFIED | `completeSale.ts`; `historical-snapshots.test.mjs` CE | None. | No / No / No |
| 59 | Historical tax immutability | VERIFIED | `completeSale.ts`; `tax-resolution.test.mjs`, `historical-snapshots.test.mjs` CE | None. | No / No / No |
| 60 | Historical payment immutability | VERIFIED | `completeSale.ts`; `payment-resolution.test.mjs`, `historical-snapshots.test.mjs` CE | None. | No / No / No |
| 61 | Historical finance evidence | VERIFIED | `journalRepository.ts`, `completeSale.ts`; `historical-snapshots.test.mjs` CE | None. | No / No / No |
| 62 | Historical loyalty evidence | PARTIAL | `completeSale.ts`; `historical-snapshots.test.mjs` CE verifies EARN evidence, `loyalty-redemption.test.mjs` verifies retry stability for REDEEM. | No master-data-mutation test specifically after redemption. | No / No / No |
| 63 | Receipt immutability | VERIFIED | `completeSale.ts`; `historical-snapshots.test.mjs` CE | None. | No / No / No |
| 64 | Cashier-summary immutability | VERIFIED | `completeSale.ts`; `historical-snapshots.test.mjs`, `callable-idempotency.test.mjs` CE | None. | No / No / No |
| 65 | Direct-client trusted-write denial | PARTIAL | `firestore.rules`; `emulator.test.mjs` CE denies critical trusted collections with client SDK. | Add direct client denial for `loyaltyBalances` and test only actual collection names rather than legacy/nonexistent aliases. | Yes / Yes / Yes |
| 66 | Owner read scope | VERIFIED | `firestore.rules`; `scopedReadClient.test.mjs` CE | None for documented read projection/receipt contract. | No / No / No |
| 67 | Cashier read scope | VERIFIED | `firestore.rules`, `cashierSaleSummaries`; `scopedReadClient.test.mjs` CE | None for documented read projection/receipt contract. | No / No / No |
| 68 | Cross-organization isolation | VERIFIED | `firestore.rules`; `crossScopeReadClient.test.mjs` CE | None. | No / No / No |
| 69 | Cross-branch isolation | VERIFIED | `firestore.rules`; `scopedReadClient.test.mjs` CE | None. | No / No / No |
| 70 | Franchise read isolation | VERIFIED | `firestore.rules`; `crossScopeReadClient.test.mjs` CE | None. | No / No / No |
| 71 | POS uses secure callable only | PARTIAL | `src/application/sales/trustedSaleClient.ts`, `OrderSummaryPanel.tsx`; `posTrustBoundary.test.ts` RT | Static source evidence only; no browser/E2E execution. POS also sends local payment labels rather than trusted method IDs. | Yes / Yes / No |
| 72 | No legacy production sale persistence | PARTIAL | POS imports `submitTrustedSale`, but `src/application/sales/completeSale.ts` and `persistence.ts` remain. `posTrustBoundary.test.ts` RT proves no POS import. | Retire or isolate legacy completion code from the production bundle and prove no caller remains. | Yes / Yes / No |
| 73 | Stable checkout idempotency key | PARTIAL | `OrderSummaryPanel.tsx`; `posTrustBoundary.test.ts` RT | Stable only while mounted; refresh loses the key. | Yes / Yes / No |
| 74 | Cart preserved on retryable failure | PARTIAL | `OrderSummaryPanel.tsx`, `trustedSaleClient.ts`; `trustedSaleClient.test.ts` RT | No rendered component/E2E assertion. | Yes / Yes / No |
| 75 | Cart cleared only on success | PARTIAL | `OrderSummaryPanel.tsx`; `posTrustBoundary.test.ts` RT | No rendered component/E2E assertion. | Yes / Yes / No |
| 76 | Duplicate-submit prevention | PARTIAL | `PaymentDialog.tsx`; `posTrustBoundary.test.ts` RT | Static guard only; no double-click or Enter interaction test. | Yes / Yes / No |
| 77 | Receipt rendering from trusted evidence | MISSING | `trustedSaleClient.ts` reconstructs a display receipt from callable totals; `PaymentDialog.tsx` displays confirmation only. | Implement server-owned receipt retrieval/rendering and test it; do not reconstruct receipt/tax/payment data in the browser. | Yes / Yes / Yes |
| 78 | Offline/timeout behavior | PARTIAL | `trustedSaleClient.ts` maps transport errors; `PaymentDialog.tsx` presents safe errors. | No request timeout policy or browser interaction test for offline, timeout, refresh, and safe retry. | Yes / Yes / No |
| 79 | Firestore rules coverage | PARTIAL | `firestore.rules`; `emulator.test.mjs`, `scopedReadClient.test.mjs`, `crossScopeReadClient.test.mjs` CE | Add actual-collection rules tests for all server-owned trusted evidence, especially loyalty balances. | Yes / Yes / Yes |
| 80 | Firestore indexes | PARTIAL | `firestore.indexes.json` contains catalog, journal, finance/loyalty, and cashier-summary indexes. | Missing/documentation-unverified matrix for sales by shift/customer/status, idempotency lease cleanup, movements/allocations, receipts, shift totals, and outbox retry queries. | Yes / Yes / Yes |
| 81 | Emulator test coverage | PARTIAL | 42 CE tests across `functions/tests/*.test.mjs`. | Missing mandatory POS browser execution and the remaining rules/index operational coverage. | Yes / Yes / Yes |
| 82 | UAT coverage | MISSING | `docs/UAT_TEST_SCRIPT.md` is only a one-paragraph pre-pilot list. | Create and execute a role/scenario/result UAT record against a deployed or emulator-approved environment. | Yes / Yes / Yes |
| 83 | Documentation completeness | PARTIAL | Sale docs and this audit exist. | `docs/SALE_TAX_SNAPSHOTS.md`, `MASTER_PLAN.md`, and `BUSINESS_RULE_BOOK.md` are absent; multiple sale docs were stale before this audit. | Yes / Yes / Yes |
| 84 | Dependency-security findings recorded | PARTIAL | `docs/DEPENDENCY_SECURITY.md` records the 2026-08-02 `npm audit --omit=dev` outcome. | 2 high and 9 moderate runtime findings remain pending compatible remediation. | Yes / Yes / Yes |

## POS evidence classification

| Item | Classification | Evidence and required disposition |
| --- | --- | --- |
| Browser/E2E interaction coverage | Mandatory blocker | The documented P4-002H acceptance requires real duplicate-click, Enter, refresh, slow-network, and retry behavior. Current evidence is static source/Vitest only. |
| Double click / Enter twice | Mandatory blocker | `PaymentDialog.tsx` has a processing guard, but no rendered interaction proof exists. |
| Refresh during checkout | Mandatory blocker | The checkout key is held in a React ref and is lost on refresh. |
| Timeout / offline behavior | Mandatory blocker | Client-safe error mapping exists but there is no timeout policy or interaction test. |
| Trusted payment labels and IDs | Mandatory blocker | The POS uses local payment enum values while the server expects trusted payment-method IDs. |
| Server-owned receipt rendering | Mandatory blocker | The browser currently constructs a confirmation receipt from response totals. |
| Remove unused local completion code | Recommended hardening | It is not imported by the POS checkout, but should be isolated/removed after callers are audited. |

## Pilot tax decision

PILOT-003 is **OPEN**. Effective server-side tax resolution, precedence, dates, embedded immutable receipt tax evidence, finance journal evidence, and historical tax immutability are emulator-verified in `tax-resolution.test.mjs` and `historical-snapshots.test.mjs`. However, the pilot definition still lacks verified mixed-tax discount allocation and a refund/reversal tax-snapshot foundation; no standalone tax-snapshot document is needed because the canonical evidence is embedded in immutable sale and receipt records.

## Closure blockers

1. **P4-002H.2 — production POS interaction evidence:** P4-002H.1 now uses trusted catalog payment IDs and selected variation/option IDs, persists a refresh-safe attempt key with server recovery lookup, and renders server-owned receipt evidence. Add component/E2E tests for duplicate click, Enter, refresh, offline, timeout, and response recovery.
2. **P4-002 security/operations hardening:** add missing actual-collection direct-write rule tests, complete the indexed query matrix, and add execution owner/recovery audit/retention semantics for stale claims.
3. **PILOT-003 tax lifecycle closure:** add mixed-tax discount-allocation and refund/reversal snapshot tests/implementation before tax pilot closure.
4. **Operational acceptance evidence:** replace the abbreviated UAT note with executed scenario evidence; restore or author the missing required planning/tax documents; record the current runtime dependency audit.

## Non-blocking hardening

- Add a positive multi-batch FIFO callable test.
- Add historical master-data-mutation evidence specifically for a redeemed loyalty sale.
- Retire the unused browser-side compatibility sale path once no non-POS callers remain.
