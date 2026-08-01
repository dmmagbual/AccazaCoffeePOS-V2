# Architecture Audit — P1

## Findings

ABP uses a feature-first layout with a shared router and application-layer use cases. React components do not directly import Firestore. Major routes are lazy-loaded.

The architecture is not yet uniformly implemented: newer foundations often have domain and services only, while older features have repositories and richer UI. Cross-feature imports still occur where shared use cases consume feature domain types. This is acceptable temporarily but must converge on public `index.ts` exports.

## Scorecard

| Area | Score | Basis |
|---|---:|---|
| Layering and modularity | 55/100 | Feature layout and lazy routes exist, but implementation depth is inconsistent. |
| Type safety and code quality | 65/100 | Strict compiler checks pass and no `any` or suppression directives were found in `src`; conventions are not yet universal. |
| Testing | 35/100 | Eleven unit-test files cover 26 tests; no emulator, integration, end-to-end, or failure-path coverage exists. |
| Security and tenancy | 30/100 | Rules cover selected collections, but later domains, route guards, attachment rules, and rule tests are incomplete. |
| Reliability and operations | 35/100 | Build tooling is healthy; transactional persistence, idempotency, migrations, and production observability are not established. |
| Overall | 44/100 | Suitable for continued development, not a production pilot. |

## Dependency direction

`pages/components → feature services → domain/repository interfaces → Firebase implementations`. Domain modules must not import React or Firebase. Application use cases may coordinate published feature APIs. Shared modules must not import feature pages.

## Readiness

Classification: **Development**. Build and test checks are reliable, but persistence, route authorization, operational transactions, rule tests, migration tooling, and many workflow integrations are incomplete.

## Incremental migration plan

1. **P2 security baseline:** add authentication/session context, protected routes,
   storage rules, and Firebase-emulator tests for each tenant and role boundary.
2. **P2 command boundary:** implement idempotent transactional use cases and
   repositories for sale completion, receiving, inventory consumption, shifts, and
   finance posting before enabling Firebase-backed UI actions.
3. **P3 consistency:** move each feature through the same domain, validation,
   repository, service, and page structure; retire duplicate FIFO and money/date
   helpers only after parity tests exist.
4. **P3 operations:** add migration scripts with dry-run and rollback notes,
   error monitoring, structured logs, backup/restore drills, and production query
   monitoring.
