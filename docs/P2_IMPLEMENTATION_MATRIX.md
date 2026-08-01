# P2 Implementation Matrix

| Issue | Severity | Impact | Strategy | Tests / migration | Status |
|---|---|---|---|---|---|
| TD-001 | Critical | Cross-tenant and ledger exposure | Default-deny Firestore/Storage rules; immutable operational collections are server-only. | Firebase emulator suite required before deployment; add `branchIds` custom claim. | Contained; blocks pilot until tested. |
| TD-002 | Critical | Duplicate or partial operational posting | Stable sale idempotency key and atomic batch persistence; server command boundary required for all ledgers. | Retry, conflict, and partial-failure integration tests. | Partially contained; blocks pilot. |
| TD-003 | High | Cross-branch/franchise access | Explicit organization/store/branch rule scopes and ADR-0002 contract. | Tenant matrix tests; migrate branch claims. | Contained in rules; blocks pilot until tested. |
| TD-004 | High | Disabled features reachable | Treat permissions/rules as enforcement; route guards require authenticated session work. | Route authorization tests. | Open; blocks pilot. |
| TD-005 | High | Regressions in critical workflows | Added idempotency regression; define full test plan. | Emulator, integration, and E2E tests. | Open; blocks pilot. |

## Pilot containment

The P2 repository baseline does not include a deployed server command layer or
Firebase emulator tooling. Therefore the rules deny browser writes to posted
operational records instead of trusting the client. This protects integrity, but
Firebase-backed pilot transactions must remain disabled until the command layer and
tests are delivered. Local development data remains available for UI validation.

No destructive data migration is included. Existing browser Firebase writes to operational ledgers are intentionally denied until trusted server commands are deployed.
