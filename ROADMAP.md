## P4-001A.0 — Firebase Functions Server Foundation

## P4-002G — Historical Snapshot Immutability Audit

Historical snapshot mutation coverage is verified by emulator test. P4-002, PILOT-002, and PILOT-003 remain open pending the remaining closure matrix and legacy/incomplete-snapshot read contract.

## P4-002E — Final Closure Audit

P4-002 and PILOT-002 remain **OPEN**. P4-002H.1 completes production POS
trusted-response alignment; browser interaction evidence (P4-002H.2),
stale-claim audit/retention, complete rule/index coverage, and executed UAT
remain. PILOT-003 remains **OPEN** for mixed-tax discount allocation and
refund/reversal snapshot evidence. The ordered scope is
`docs/P4_002_REMAINING_WORK.md`.

Functions build, lint, and non-emulator tests are available. Java 21 is available for the emulator; the final audit run could not start the standard suite because an existing Firestore emulator owns port 8080. P4-001A repositories and P4-002 remain open.

## P4-001A.1 — Server Catalog Repositories

Server-side resolution contracts and Admin SDK repositories are in place for catalog, recipe, tax, payment, and branch authorization. P4-002 remains open pending a secure callable and durable sale-effect integration.

## P4-002B.0 — Shared Inventory Package Boundary

Complete. The shared package is consumable by the root app and Functions. P4-002B.1 remains open to replace the sale-local allocation implementation.

## P4-002C.0 — Trusted Finance and Loyalty Server Infrastructure

Server repositories and resolution contracts are in place. P4-002C.1 remains open to invoke finance, loyalty, and durable shift totals from the trusted sale transaction. P4-002 and PILOT-002 remain open.

## P4-002C.1 — Final Trusted Sale Integration

The trusted transaction now invokes Finance, Loyalty earning, and shift-total persistence. P4-002 and PILOT-002 remain open pending the complete seeded callable-sale emulator test matrix, including redemption and failure-path evidence.
