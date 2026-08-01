# Operational Pilot Readiness Audit

Updated 2026-08-02.

## Decision

The platform is **not ready for an operational sales pilot**. P4-002 and PILOT-002 remain open despite substantial real callable emulator evidence.

## What is verified

- Authenticated, authorized, server-resolved sale completion.
- Idempotent receipt, payment, inventory, COGS, Finance, loyalty, shift, audit, outbox, and cashier-summary evidence.
- Failure injection at all listed persistence stages with rollback and clean retry.
- Immutable historical server evidence after live master-data changes.
- Client-SDK direct write denial and scoped owner/cashier/cross-organization/franchise reads.

## Pilot blockers

1. The production POS uses local payment labels rather than authoritative payment-method IDs and does not carry variations/options through its minimal request.
2. Checkout retry idempotency does not survive a browser refresh; no browser interaction test proves duplicate click, Enter, offline, or timeout behavior.
3. The browser has no server-owned receipt renderer/reprint path.
4. Stale claims are reclaimable but lack execution-owner/recovery-audit/retention evidence.
5. Trusted rule coverage and Firestore index coverage are not complete for all actual collections and operational queries.
6. UAT is not an executable, observed script; mandatory planning/tax-source documents are missing.

PILOT-003 also remains open for mixed-tax discount allocation and refund/reversal tax snapshot evidence.
