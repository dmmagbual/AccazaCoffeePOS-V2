# POS Trust Boundary Audit

Updated 2026-08-02. The browser checkout code is intentionally a client of the trusted callable, not a sales persistence engine.

## Confirmed source boundary

`src/features/pos/components/OrderSummaryPanel.tsx` calls `submitTrustedSale`; `src/application/sales/trustedSaleClient.ts` invokes the `completeSale` callable. `src/features/pos/posTrustBoundary.test.ts` confirms these checkout files contain no Firestore write primitive or trusted-sale collection write. `firestore.rules` independently denies client writes to trusted evidence.

```text
POS identifiers / quantities / tender intent
  -> completeSale callable
  -> server context + catalog/tax/payment/recipe resolution
  -> atomic trusted records
  -> response with identifiers/totals/correlation ID
```

## P4-002H.1 alignment — 2026-08-02

- Payment choices load client-safe configured `paymentMethods` records and
  submit `paymentMethodId`, never a display label, settlement category, or
  financial-account mapping.
- Trusted request mapping carries only product, variation, and option-item
  identifiers plus requested quantities. Names, prices, tax, recipe, and COGS
  remain server-resolved.
- Checkout recovery persists a minimum local attempt record and uses the
  authenticated `getSaleAttempt` callable to resolve a refreshed uncertain
  submission. Cart clearing occurs only after a committed trusted result.
- The success display is based on the callable result plus the immutable
  persisted receipt read model. The former synthetic confirmation receipt is
  removed from the production client.
- `completeSale.ts`, local persistence, and `receiptService.ts` are legacy
  compatibility utilities only; POS checkout imports none of them.

Browser interaction/E2E evidence for duplicate clicks, Enter, refresh, offline,
and timeout remains P4-002H.2 work.

## Non-blocking hardening

`src/application/sales/completeSale.ts` and `persistence.ts` remain legacy/local compatibility code. They are not imported by the POS checkout, but should be isolated or removed after a caller audit.

P4-002H.1 is the smallest mandatory next step. P4-002 and PILOT-002 remain open.
