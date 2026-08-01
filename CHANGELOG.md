# Changelog

## P4-002G — Historical Snapshot Immutability Audit

- Added real callable emulator coverage for immutable sale, receipt, cashier-summary, payment, inventory/COGS, Finance, loyalty, audit, and outbox evidence after live master-data changes.
- Completed idempotent retries now reuse committed results after trusted context validation and before mutable catalog resolution.

All notable changes to the Accaza Business Platform will be documented in this file.

The format is based on Keep a Changelog, and the project follows Semantic Versioning.

## [Unreleased]

- Added Firebase Functions runtime foundation; trusted repositories and sales callable remain open.
- Added Functions request-context and emulator test fixtures; local emulator execution requires Java.
- Added server-only catalog, recipe, tax, payment, branch-authorization, and trusted-sale input resolver foundations; no public sale handler was added.
- Added the `@abp/inventory-consumption` workspace package shared by application and Functions builds.
- Refactored trusted-sale inventory effects to consume the shared inventory package.
- Added P4-002C.0 server-only Finance, Loyalty, shift-total, and outbox contracts; sale-path posting remains intentionally pending.
- Integrated trusted sale Finance journals, loyalty earning, and deterministic shift totals; pilot closure remains pending full callable-sale emulator coverage.
- Added server-owned cashier sale-summary projections for client-safe POS history.

### Added
- Recipe Master lifecycle, immutable numbering, ownership, permission-gated
  workflow transitions, cloning, search, and RS-001 documentation.
- Catalog domain foundations for hierarchy, variations, prices, modifiers, add-ons,
  combos, availability, and POS layout metadata.
- Business Setup Wizard route, resumable validation, idempotent setup planning,
  and setup documentation.
- Settings and Configuration Center with categorized links to existing business
  configuration modules.
- Architecture, dependency, code-quality, error-handling, date/time, money,
  security, testing, Firestore-query, and technical-debt standards.
- ADRs for feature boundaries, tenant-scoped repositories, and immutable
  operational records.

### Changed
- Added a `typecheck` verification command and tightened environment-file ignores.

### Fixed

### Removed

---

## [0.10.0] - 2026-08-01

### Added
- Workflow, approval, task, escalation, SLA, and automation engine
- Centralized workflow definitions and state transitions
- Unified workflow inbox and approval history
- Workflow analytics integration

## [0.9.0] - 2026-08-01

### Added
- Business Intelligence, KPI, dashboard, report, and alert platform
- Standard analytics providers
- Reusable metric registry
- Branch and organization analytics
- Analytical projections and drill-downs

## [0.8.0] - 2026-08-01

### Added
- Master Data Management and reference-data platform
- Global data dictionary
- Unified search
- Duplicate detection and merge support
- Centralized units, categories, tags, reasons, taxes, and payment methods

## [0.7.0] - 2026-08-01

### Added
- Customer CRM
- Loyalty points and rewards
- Membership tiers
- Promotions and coupons
- Gift-card foundation
- Customer analytics and POS integration

## [0.6.0] - 2026-07-31

### Added
- Inter-branch inventory transfers
- Transfer requests, approvals, dispatch, and receiving
- In-transit inventory
- Transfer discrepancies and replenishment suggestions

## [0.5.0] - 2026-07-31

### Added
- Finance foundation
- Supplier invoices and Accounts Payable
- Supplier payments
- Expense management
- Cash, bank, digital wallet, and petty-cash accounts
- Journal-entry and accounting-period foundations

## [0.4.5] - 2026-07-31

### Added
- Platform configuration and feature management
- Simple-storage mode
- Scalable storage-location model
- Batch statuses
- Internal location transfers

## [0.4.0] - 2026-07-31

### Added
- Manufacturing and production engine
- Production recipes and orders
- Semi-finished products
- Yield and production-cost tracking
- Production-batch traceability

## [0.3.5] - 2026-07-31

### Added
- ABP Business Rule Book
- Platform governance and decision hierarchy
- Inventory, recipe, procurement, audit, and costing rules

## [0.3.0] - 2026-07-31

### Added
- Unified inventory-consumption engine
- FIFO batch allocation
- Controlled negative inventory
- Staff consumption with recipe modifications
- Named R&D trials and development-cost tracking
- Waste, spoilage, reconciliation, and reversals

## [0.2.0] - 2026-07-31

### Added
- Procurement and batch-inventory foundation
- Supplier master
- Purchase orders
- Direct and online purchases
- Goods receiving
- Inventory batches and FIFO costing

## [0.1.0] - 2026-07-31

### Added
- ABP application foundation
- POS core
- Cart, checkout, payments, and receipts
- Complete sale pipeline
- Master data, ingredients, and recipe engine
- Shift and store operations
