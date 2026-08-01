# P4-002 Trusted Sales Execution Engine Closure Audit

Audit date: 2026-08-02. This is an evidence-only audit. `VERIFIED` means both implementation and directly relevant automated evidence were found. A passing build or lint command is not treated as behavioral proof.

## Executive conclusion

P4-002 is **not ready to close** and `PILOT-002` remains **OPEN**. The secure callable, authoritative core, persistent idempotency, core inventory persistence, receipt/audit/outbox records, cashier projection, and several rules tests exist. Critical closure evidence is still absent for controlled-negative inventory, stale claims, all finance/loyalty production paths, rollback injection, historical snapshot changes, variation/options, and complete POS behavior.

Evidence-weighted completion is **61%**: 12 VERIFIED, 25 PARTIAL, and 3 MISSING requirements. This is implementation-and-test coverage only; it is not pilot readiness.

### Evidence keys

- `CE` = Functions emulator evidence from `npm run emulators:test` on 2026-08-02 (28 passing, 0 failing).
- `FT` = Functions test evidence from `npm run functions:test` outside emulators (12 passing, 16 emulator-only tests skipped).
- “None” means no directly relevant automated test was found.

## Requirement matrix

| # | Requirement | Status | Source evidence | Test / emulator evidence | Remaining gap | Blocks P4-002 / PILOT-002 |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Secure callable entry point | VERIFIED | `functions/src/index.ts`, `functions/src/shared/callableErrors.ts` | `functions/tests/emulator.test.mjs`, `functions/tests/callable-idempotency.test.mjs` (CE) | None for endpoint existence/authentication. | No / No |
| 2 | Trusted request context | PARTIAL | `functions/src/shared/requestContext.ts`, `functions/src/authorization/branchAuthorizationRepository.ts` | `functions/tests/foundation.test.mjs`, `functions/tests/emulator.test.mjs` (FT, CE) | Context derives identity claims, but does not parse declared `franchiseOrganizationId` or `headOfficeScope`; no trusted role-record resolution. | Yes / Yes |
| 3 | Server-side product resolution | PARTIAL | `functions/src/catalog/productRepository.ts`, `functions/src/sales/trustedSaleInputResolver.ts` | Seeded callable product in `functions/tests/emulator.test.mjs`, `functions/tests/callable-idempotency.test.mjs` (CE) | No explicit active/inactive, forged-price, effective-date, or branch-availability matrix. | Yes / Yes |
| 4 | Server-side variation resolution | PARTIAL | `functions/src/catalog/variationRepository.ts`, `functions/src/sales/trustedSaleInputResolver.ts` | None | No real callable variation fixture; no wrong-product or price test. | Yes / Yes |
| 5 | Server-side option resolution | PARTIAL | `functions/src/catalog/optionGroupRepository.ts`, `functions/src/catalog/optionItemRepository.ts`, `functions/src/catalog/productOptionAssignmentRepository.ts`, `functions/src/sales/trustedSaleInputResolver.ts` | None | Required/minimum selection and option tax/effect sale coverage are absent; option ingredient effects are not included in inventory requirements. | Yes / Yes |
| 6 | Published recipe resolution | PARTIAL | `functions/src/recipes/recipeRepository.ts`, `functions/src/sales/trustedSaleInputResolver.ts` | Published recipe seeded in callable tests (CE) | No draft, expired, protected Head Office, product/variation-link rejection matrix. | Yes / Yes |
| 7 | Effective tax resolution | PARTIAL | `functions/src/tax/taxRepository.ts`, `functions/src/tax/taxResolver.ts`, `functions/src/sales/trustedSaleInputResolver.ts` | One tax profile/version seeded in callable tests (CE) | No priority/effective-date/mixed-tax/option-tax tests; option tax is not passed to line resolution. | Yes / Yes; also PILOT-003 |
| 8 | Payment-method validation | PARTIAL | `functions/src/payments/paymentMethodRepository.ts`, `functions/src/sales/completeSale.ts` | Cash payment fixture (CE) | Currency validation method exists but is not invoked by resolver; no digital/split/inactive/branch restriction matrix. | Yes / Yes |
| 9 | Durable idempotency | VERIFIED | `functions/src/sales/completeSale.ts` | `functions/tests/complete-sale-regression.test.mjs`, `functions/tests/callable-idempotency.test.mjs` (FT, CE) | None for completed-record persistence. | No / No |
| 10 | Same-request retry behavior | VERIFIED | `functions/src/sales/completeSale.ts` | `functions/tests/callable-idempotency.test.mjs` (CE) | None for seeded cash sale retry. | No / No |
| 11 | Changed-request conflict behavior | VERIFIED | `functions/src/sales/completeSale.ts`, `functions/src/shared/callableErrors.ts` | `functions/tests/callable-idempotency.test.mjs` (CE) | None for materially changed quantity. | No / No |
| 12 | Stale `CLAIMED` recovery | PARTIAL | `functions/src/sales/completeSale.ts` | None | Expired leases are not rejected, but no execution owner, recovery audit, retention process, or emulator reclaim test exists. | Yes / Yes |
| 13 | FIFO allocation | PARTIAL | `packages/inventory-consumption/src/service.ts`, `functions/src/sales/completeSale.ts` | `functions/tests/complete-sale-regression.test.mjs`, single-batch callable movement assertions (FT, CE) | No real callable multi-batch FIFO allocation test. | Yes / Yes |
| 14 | Controlled negative inventory | PARTIAL | `packages/inventory-consumption/src/service.ts`, `functions/src/sales/completeSale.ts` | Package/static regression coverage only (FT) | No emulator test for allowed negative allocation or prohibited-negative rollback. | Yes / Yes |
| 15 | `SALE_CONSUMPTION` movements | VERIFIED | `functions/src/sales/completeSale.ts`, `packages/inventory-consumption/src/service.ts` | `functions/tests/emulator.test.mjs`, `functions/tests/callable-idempotency.test.mjs` (CE) | Positive allocation is proven; negative movement coverage belongs to requirement 14. | No / No |
| 16 | Inventory-balance mutations | VERIFIED | `functions/src/sales/completeSale.ts`, `packages/inventory-consumption/src/service.ts` | `functions/tests/callable-idempotency.test.mjs` compares balance across retry (CE) | No negative-balance scenario. | No / No |
| 17 | Confirmed/provisional COGS | PARTIAL | `packages/inventory-consumption/src/service.ts`, `functions/src/sales/completeSale.ts` | Confirmed-cost path in callable tests (CE) | No provisional or mixed COGS persistence test. | Yes / Yes |
| 18 | Product and variation snapshots | PARTIAL | `functions/src/catalog/productRepository.ts`, `functions/src/catalog/variationRepository.ts`, `functions/src/sales/completeSale.ts` | Product-backed sale only (CE) | No variation snapshot assertion or historical mutation test. | Yes / Yes |
| 19 | Recipe-version snapshots | PARTIAL | `functions/src/recipes/recipeRepository.ts`, `functions/src/sales/completeSale.ts` | Recipe fixture resolves (CE) | No assertion of version snapshot or subsequent version change. | Yes / Yes |
| 20 | Option/add-on snapshots | PARTIAL | `functions/src/catalog/optionItemRepository.ts`, `functions/src/sales/completeSale.ts` | None | No real callable add-on fixture, snapshot assertion, or inventory effect coverage. | Yes / Yes |
| 21 | Tax snapshots | PARTIAL | `functions/src/tax/taxResolver.ts`, `functions/src/sales/completeSale.ts` | Basic tax fixture resolves (CE) | Embedded tax snapshot has no effective-date/mixed-tax/historical test. | Yes / Yes; also PILOT-003 |
| 22 | Payment snapshots | PARTIAL | `functions/src/payments/paymentMethodRepository.ts`, `functions/src/sales/completeSale.ts` | Payment document count assertion (CE) | No snapshot content, digital wallet, or split-payment test. | Yes / Yes |
| 23 | Receipt snapshots | PARTIAL | `functions/src/sales/completeSale.ts` | `functions/tests/callable-idempotency.test.mjs` compares retry-stable receipt (CE) | No master-data-change historical receipt test. | Yes / Yes |
| 24 | Shift totals | PARTIAL | `functions/src/shifts/shiftTotalsRepository.ts`, `functions/src/sales/completeSale.ts` | `functions/tests/emulator.test.mjs`, `functions/tests/callable-idempotency.test.mjs` (CE) | No two-sale, split-category, or shift failure test. | Yes / Yes |
| 25 | Finance posting | PARTIAL | `functions/src/finance/saleFinanceResolver.ts`, `functions/src/finance/journalRepository.ts`, `functions/src/sales/completeSale.ts` | `functions/tests/finance-loyalty-boundary.test.mjs`, direct repository transaction test (FT, CE) | No real callable configured-finance journal scenario, failure/retry path, or period matrix. | Yes / Yes |
| 26 | Loyalty earn | PARTIAL | `functions/src/loyalty/saleLoyaltyResolver.ts`, `functions/src/loyalty/loyaltyTransactionRepository.ts`, `functions/src/sales/completeSale.ts` | `functions/tests/finance-loyalty-boundary.test.mjs`, direct repository transaction test (FT, CE) | No real callable customer earn/retry scenario. | Yes / Yes |
| 27 | Loyalty redemption | MISSING | `docs/SALE_LOYALTY_INTEGRATION.md` | None | Documentation explicitly records redemption as unimplemented. | Yes / Yes |
| 28 | Audit records | VERIFIED | `functions/src/sales/completeSale.ts` | `functions/tests/emulator.test.mjs`, `functions/tests/callable-idempotency.test.mjs` (CE) | None for one completed sale/retry. | No / No |
| 29 | Outbox events | VERIFIED | `functions/src/sales/completeSale.ts` | `functions/tests/callable-idempotency.test.mjs` (CE) | One `SaleCompleted` event is proven; retry consumer behavior is outside this evidence. | No / No |
| 30 | Cashier sale-summary projection | VERIFIED | `functions/src/sales/completeSale.ts`, `firestore.rules` | `functions/tests/callable-idempotency.test.mjs`, `functions/tests/scopedReadClient.test.mjs` (CE) | None for projection creation, retry stability, and permitted reads. | No / No |
| 31 | Cross-organization isolation | VERIFIED | `firestore.rules`, `functions/src/authorization/branchAuthorizationRepository.ts` | `functions/tests/crossScopeReadClient.test.mjs`, callable authorization tests in `functions/tests/emulator.test.mjs` (CE) | Callable franchise-claim parsing is separately incomplete. | No / No |
| 32 | Franchise isolation | PARTIAL | `firestore.rules`, `functions/tests/fixtures/authUsers.mjs` | `functions/tests/crossScopeReadClient.test.mjs` (CE) | Client reads are denied, but request context does not parse franchise/head-office fields and no callable franchise authorization test exists. | Yes / Yes |
| 33 | Direct-client trusted-write denial | VERIFIED | `firestore.rules` | `functions/tests/emulator.test.mjs` “cannot forge trusted sale evidence” (CE) | Current denial set is proven; periodic expansion needed as collections evolve. | No / No |
| 34 | Authorized owner/cashier reads | VERIFIED | `firestore.rules`, `cashierSaleSummaries` projection in `functions/src/sales/completeSale.ts` | `functions/tests/scopedReadClient.test.mjs` (CE) | Contract is limited to safe projection/receipt evidence by design. | No / No |
| 35 | Duplicate-effect protection | PARTIAL | `functions/src/sales/completeSale.ts`, `functions/src/shifts/shiftTotalsRepository.ts`, `functions/src/finance/journalRepository.ts`, `functions/src/loyalty/loyaltyTransactionRepository.ts` | `functions/tests/callable-idempotency.test.mjs` (CE) | Retry proves core documents and zero configured finance/loyalty effects; it does not prove configured journal/loyalty duplication or all failure paths. | Yes / Yes |
| 36 | Failure injection and rollback | MISSING | Atomic transaction structure in `functions/src/sales/completeSale.ts` | None | No injected inventory/receipt/shift/outbox/transaction-conflict tests. | Yes / Yes |
| 37 | Historical snapshot immutability | MISSING | Immutable fields in `functions/src/sales/completeSale.ts` | Retry-only equality in `functions/tests/callable-idempotency.test.mjs` (CE) | No product, price, recipe, tax, or option master-data change test. | Yes / Yes |
| 38 | POS production checkout behavior | PARTIAL | `src/features/pos/components/OrderSummaryPanel.tsx`, `src/application/sales/trustedSaleClient.ts` | None | POS calls callable and retains a key until success, but has no component/e2e proof, does not surface correlation IDs, and still relies on local operational readiness/state. | Yes / Yes |
| 39 | Rules and indexes | PARTIAL | `firestore.rules`, `firestore.indexes.json` | Rule tests in `functions/tests/emulator.test.mjs`, `functions/tests/scopedReadClient.test.mjs`, `functions/tests/crossScopeReadClient.test.mjs` (CE) | Rules are tested for key reads/writes, but required sale/idempotency/allocation/outbox indexes are incomplete or undocumented; no index query matrix. | Yes / Yes |
| 40 | Documentation and UAT coverage | PARTIAL | `docs/TRUSTED_SALES_EXECUTION_ENGINE.md`, `docs/SALE_*.md`, `docs/PILOT_GAP_REGISTER.md` | `functions/tests/*.test.mjs` (CE/FT) | Documentation remains internally outdated in places and UAT/complete callable matrix is incomplete. | Yes / Yes |

## Closure blockers

1. Complete real-callable catalog matrix: variation, options/add-ons, required option rules, published recipe failure paths, tax precedence/effective dates, and payment variants.
2. Add real emulator tests for multi-batch FIFO, allowed/prohibited negative inventory, provisional/mixed COGS, and their persisted evidence.
3. Complete stale-claim recovery semantics with owner/audit/retention and prove safe reclaim.
4. Prove configured finance posting and loyalty earn are duplicate-safe through the real callable; implement and prove loyalty redemption if it is in pilot scope.
5. Add transaction failure-injection/rollback tests for every critical persistence boundary.
6. Add historical master-data mutation tests and POS production-behavior tests.
7. Complete the trusted collection index matrix and reconcile documentation/UAT with actual behavior.

## Pilot status

- `PILOT-002`: **OPEN** — critical success and rollback matrix is incomplete.
- `PILOT-003`: **OPEN** — tax snapshot source exists, but full effective-date, receipt, finance, and historical proof is absent.

## P4-002G update — 2026-08-02

`functions/tests/historical-snapshots.test.mjs` now provides real callable emulator evidence that version-A product/category, variation, option, recipe, tax, payment, Finance, loyalty, inventory/COGS, receipt, and cashier-summary records remain unchanged after live configuration mutations. Historical snapshot immutability is now **PARTIAL** rather than missing: malformed/missing legacy snapshot read handling and independent historical UI-reader coverage remain open. PILOT-002 and PILOT-003 remain **OPEN**.
