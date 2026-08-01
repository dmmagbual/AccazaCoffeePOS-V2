# POS Checkout State Machine

P4-002H.1 uses a small browser recovery record scoped to `branchId + shiftId`.
It is stored in `localStorage` to make the same tab and another tab see one
attempt. The record contains only an idempotency key, a non-secret fingerprint,
state timestamps, correlation ID, and committed identifiers. It never stores
raw tender references, card data, receipt details, or trusted sale evidence.

```text
IDLE -> READY -> SUBMITTING -> COMMITTED -> cleared
                    |             |
                    |             -> receipt loaded from server record
                    v
                UNCERTAIN -> recovery lookup -> COMMITTED | remains UNCERTAIN
                    |
                    -> FAILED_RETRYABLE -> retry with same key
                    -> FAILED_FINAL -> explicit edit/cancel before new attempt
```

`OrderSummaryPanel` disables checkout while an attempt is `SUBMITTING` or
`UNCERTAIN`; `PaymentDialog` separately blocks concurrent click submissions.
The persisted key is only cleared after a committed trusted result or explicit
cart cancellation. A changed cart or tender fingerprint starts a new attempt
only after an unresolved previous attempt has been resolved.

`getSaleAttempt` is a narrow authenticated callable recovery lookup. It checks
organization, branch, and `sales.complete` scope and returns only a completed
sale result or pending/not-found state; it never returns idempotency internals.

Browser interaction/E2E proof for refresh, duplicate click, and timeout remains
P4-002H.2 work. P4-002 and both pilot gaps remain open.
