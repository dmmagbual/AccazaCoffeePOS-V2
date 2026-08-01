# POS Trust Boundary Audit

Audit scope: P4-002H production POS checkout behavior. This document records source and automated-test evidence only; it does not close P4-002 or either pilot gap.

## Current checkout flow

`OrderSummaryPanel` opens `PaymentDialog` after an open-shift check. It creates one `checkoutKey` per checkout attempt, forwards payment intent to `submitTrustedSale`, clears the cart only after a successful trusted response, and retains the key for retry after a recoverable failure.

```text
Browser POS
  -> identifier-only payment intent + stable idempotency key
  -> Firebase callable: completeSale
  -> trusted request context + server resolution
  -> transactional sale / receipt / payment / inventory / finance / loyalty / shift evidence
  -> trusted response: saleId, receiptNumber, totals, change, correlationId
  -> browser success display
```

## Responsibilities

Browser responsibilities are limited to cart identifiers and quantities, payment method identifiers/amounts/references, one stable idempotency key, invocation, and display of the trusted result. The browser does not calculate authoritative product price, tax, recipe, COGS, change, receipt lines, inventory, Finance, loyalty, or shift totals.

The callable resolves and persists authoritative sale evidence. It is the only production checkout command used by `src/features/pos/components/OrderSummaryPanel.tsx`.

## Browser write boundary

The browser must never write `orders`, `receipts`, `payments`, `saleIdempotency`, `stockMovements`, `inventoryBalances`, `journalEntries`, `loyaltyTransactions`, `auditLogs`, `outboxEvents`, `shiftTotals`, or `cashierSaleSummaries`. POS source has no `firebase/firestore` import and no Firestore write primitive. Firestore Rules independently deny client writes to trusted evidence.

## Firestore write audit

| Source | Finding | Classification |
| --- | --- | --- |
| `src/features/pos/**` and `src/application/sales/trustedSaleClient.ts` | No `addDoc`, `setDoc`, `updateDoc`, `writeBatch`, or transaction call. | VALID |
| `src/application/store-operations/firebase.ts` | Writes shift open/close records only; it does not write sale evidence or shift totals. | VALID, outside checkout |
| `src/shared/firebase/firestoreRepository.ts` | Generic repository can write a caller-supplied collection; it must never be wired to trusted-sale collections. | LEGACY boundary risk |
| `src/application/sales/completeSale.ts` and `persistence.ts` | Compatibility/local-ledger sale flow. It is not imported by POS checkout and must not be restored as a production fallback. | LEGACY / REMOVE from future production bundle |

## Duplicate and failure behavior

`PaymentDialog` disables completion while processing. The checkout key persists through retry; the server returns the original completed result for a same-key same-request retry. Client errors now preserve a callable correlation ID when supplied and use safe messages for validation, authorization, conflict, offline/timeout, and internal failures. The cart and payment state clear only after success.

## Receipt and inventory evidence

POS success presentation uses callable `saleId`, receipt number, total, and change. It does not write or construct authoritative receipt, tax, recipe, payment, or inventory evidence. Full customer receipt rendering from the server-owned receipt document remains a separate operational UX requirement; the present payment dialog is a completion confirmation, not a receipt renderer.

## Remaining recommended removals

1. Retire the unused client-side compatibility `completeSale` and local sale ledger once remaining non-POS callers are removed.
2. Replace local payment method labels with trusted catalog payment-method IDs before operational rollout.
3. Add browser-component or end-to-end test tooling for actual double-click, Enter, refresh, and timeout UI interactions; current regression tests prove the code-level guard and callable boundary.

## Status

P4-002, PILOT-002, and PILOT-003 remain open. This audit verifies the browser trust boundary; it does not replace the remaining operational closure evidence.
