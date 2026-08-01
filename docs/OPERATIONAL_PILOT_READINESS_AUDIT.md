# Operational Pilot Readiness Audit

Audit date: 2026-08-01. Evidence was limited to implemented source, route registration, Firestore rules, and automated tests. Sprint plans and prior documents were not accepted as implementation evidence.

## Classification

**BLOCKED — not ready for an operational pilot.** The local demonstration can complete a simple, shift-gated sale, but an owner cannot safely configure or persist the complete operational data set and a sale does not yet produce stock, tax, audit, or finance evidence.

| Area | Status | Evidence / finding |
| --- | --- | --- |
| Settings and business setup | PARTIALLY_IMPLEMENTED | Landing, setup, Master Data, Catalog, Ingredients, Recipe Studio, Finance, HR, and Feature routes compile. They are not route-guarded and most configuration pages are landing/local-state pages. |
| Product categories | PARTIALLY_IMPLEMENTED | `MenuManagementPage` creates, edits, reorders, and deactivates local categories. It has no repository persistence, description/POS visibility/branch availability editor, or historical-reference check. |
| Menu item creation | MISSING | `CatalogProduct` models the fields, but no product editor/repository workflow creates a menu item through Settings. POS loads `products.json`. |
| Sizes and variations | PARTIALLY_IMPLEMENTED | Catalog types and validation support variations/defaults/prices/recipes; no Settings UI, POS filtering, or sale/receipt variation snapshot exists. |
| Option groups and items | PARTIALLY_IMPLEMENTED | Catalog and Recipe Studio types model selection and ingredient effects. No reusable option editor or POS selection/price engine exists. |
| Option impact on sale/inventory | BLOCKED | Modifier IDs now reach sale snapshot construction, but cart pricing, receipt detail, stock movements, FIFO allocation, COGS confirmation, and BI modifier metrics do not execute. |
| Ingredient master | PARTIALLY_IMPLEMENTED | Strict master model, Zod, repositories, service tests, local UI, and deactivation exist. Supplier links, advanced policies, dependency analysis, and persisted UI operations are incomplete. |
| Units and conversions | PARTIALLY_IMPLEMENTED | Standard units and compatible conversion services exist. Ingredient-specific package/bottle/density conversions and universal consumption reuse are not verified. |
| Opening inventory | MISSING | No opening-inventory document, approval/posting workflow, atomic batch/movement write, or compensating reversal route was found. |
| Suppliers and procurement | PARTIALLY_IMPLEMENTED | Supplier/PO/receiving/batch/FIFO services and types exist; current page is not a complete persistent workflow. |
| Recipe master and builder | PARTIALLY_IMPLEMENTED | Draft/publish/version/cost services and local builder exist. Product/variation linking, immutable numbering, approval enforcement, attachments, margin, and full comparison are incomplete. |
| Configurable tax | PARTIALLY_IMPLEMENTED | Effective-dated decimal profiles, resolver, snapshots, rules, route, and tests exist. Profile CRUD/repository and POS/receipt/refund/finance migration are incomplete. |
| Chart of accounts | PARTIALLY_IMPLEMENTED | Seed, validation, AP and journal services exist. No account-maintenance UI/repository, dependency view, or configured tax posting. |
| Employees, users, access | PARTIALLY_IMPLEMENTED | Separate HR models, assignment/attendance services, and rules exist. Owner setup and identity/role management UI are not implemented. |
| POS end-to-end | PARTIALLY_IMPLEMENTED | Cart, payment, idempotent sale persistence contract, recipe snapshot, and shift gate are tested. Customer/loyalty, variations, options, tax snapshots, inventory, audit, events, and settlement are missing. |
| Shift and reconciliation | PARTIALLY_IMPLEMENTED | Local open/close/report service validates cashier ownership and cash variance. It lacks persistent settlement/refund aggregation and audit-backed posting. |
| Security and tenancy | PARTIALLY_IMPLEMENTED | Firestore is default-deny with scoped collection rules and browser writes denied for financial/inventory evidence. No authenticated route guards, emulator rule tests, or role claim lifecycle tests exist. |
| Current-store usability | VERIFIED | POS and setup default to one local branch; advanced pages are separate rather than forced into checkout. |
| Route/UI smoke test | PARTIALLY_IMPLEMENTED | Registered routes compile through Vite lazy imports. No browser/UAT automation was present; missing routes are listed below. |

## Routes

Registered and build-verified: `/settings`, `/setup`, `/pos`, `/menu-management`, `/master-data`, `/ingredients`, `/recipes`, `/operations`, `/procurement`, `/finance`, `/finance/tax-configuration`, `/hr`, `/crm`, `/analytics`, and catalog aliases.

Missing dedicated routes: Business Profile, Branches, Payment Methods, Units and Conversions, Supplier Links, Inventory Policies, Opening Inventory, Chart of Accounts, Cash and Bank Accounts, Users, Roles and Permissions, Recipe Master, and Inventory. Catalog option and variation aliases currently route to existing Menu Management or Recipe Studio pages rather than dedicated editors.

## Tax audit

No production `GST_RATE`, `VAT_RATE`, or `TAX_RATE` constant exists. The former setup-wizard default rate was removed. Test fixtures retain arbitrary rates to exercise calculation behavior. Legacy POS cart, receipt, procurement, and sale input still carry numeric `taxRate`; they are migration targets and must not be presented as profile/snapshot capable.

## Pilot blockers

See [PILOT_GAP_REGISTER.md](PILOT_GAP_REGISTER.md). The blocking sequence is: persistent catalog/configuration and authorization; stock/batch consumption plus atomic sale persistence; tax snapshot migration; opening inventory; shift settlement and reconciliation evidence; UAT/emulator coverage.
