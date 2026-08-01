# Technical Debt Register

| ID | Severity | Area | Action | Target |
|---|---|---|---|---|
| TD-001 | Critical | Security | Default-deny rules and attachment rules added; emulator coverage and route authorization remain required. | P2 |
| TD-002 | Critical | Persistence | Sale idempotency added; trusted transactional command layer remains required for operational workflows. | P2 |
| TD-003 | High | Tenancy | Standardize organization/branch/franchise ownership contracts and queries. | P2 |
| TD-004 | High | Feature flags | Gate direct routes and backend actions, not navigation alone. | P2 |
| TD-005 | High | Testing | Add integration, failure-path, and migration tests. | P2 |
| TD-006 | Medium | Dates/money | Adopt shared timezone and decimal helpers across services. | P3 |
| TD-007 | Medium | Documentation | Complete module documents only when functionality exists. | P3 |
