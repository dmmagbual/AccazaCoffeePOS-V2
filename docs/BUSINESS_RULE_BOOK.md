# Accaza Business Platform Business Rule Book

## 1. Platform Principles

1. ABP exists to operate Accaza Coffee as a controlled, multi-branch business platform and to support future franchise operations.
2. Business rules take precedence over screen design, convenience shortcuts, and local branch preferences.
3. ABP is event-driven: material business actions produce a durable business record, an audit record, and—where applicable—an immutable ledger movement.
4. ABP is audit-first. Every financial event, inventory event, approval, reversal, and status transition must identify the actor, time, branch, reference, and reason.
5. Inventory changes must never be hidden. There is no direct quantity mutation outside the shared inventory-consumption and receiving workflows.
6. Financial events must be traceable to their originating business document and supporting evidence.
7. Historical records are immutable. Corrections use a compensating reversal and replacement record; they never silently rewrite posted history.

## 2. Organization Structure

The operating hierarchy is Organization → Branch → Store → Shift → Employee → Transaction. An organization owns master data and policy. A branch is an accountable operating location. A store is the inventory, sales, and cash-control scope. A shift is a cashier accountability period. An employee performs transactions within an authorized store and shift.

Head Office controls recipes, core ingredient standards, enterprise permissions, supplier policy, and organization-wide reporting. Branches operate approved standards, receive goods, run shifts, and record approved exceptions. Franchise operations consume Head Office standards and may not create competing master definitions or recipe overrides.

## 3. Recipe Studio

Recipes belong to Head Office. Branches may use, view, and execute approved recipes but may not modify them. Each recipe has versions with a lifecycle of Draft, Testing, Approved, and Retired. Published/approved versions are immutable. Editing an approved version creates a new draft.

Every sale, staff consumption, trial, and production transaction preserves the recipe ID and exact recipe version used. Historical COGS and preparation instructions must never be recalculated from a later recipe version. Recipe approval requires an authorized approver and an effective date.

## 4. Ingredients

The Ingredient Master is the organization’s single source of truth. Every ingredient has a base inventory unit, purchasing unit, approved conversion, supplier relationship, cost attributes, shelf-life data, and status. Recipe and inventory consumption operate in the base unit.

Weight, volume, and count conversions are permitted only when compatible and explicitly configured. Packaging conversions such as pack-to-piece or bottle-to-milliliter require a documented factor. ABP must not infer conversions between incompatible dimensions. Preferred supplier means the default commercial relationship; it does not prohibit approved alternate suppliers.

## 5. Procurement

Approved purchasing methods are Purchase Order supplier delivery, Direct Purchase, and Online Purchase through Shopee, Lazada, or another marketplace. All procurement documents identify supplier or source, branch, currency, payment terms, lines, cost, tax, status, and supporting references.

Supplier payment terms include cash, COD, Net 7, Net 15, Net 30, Net 45, Net 60, and approved custom terms. Goods receiving verifies ordered versus actual quantity, accepted quantity, rejection, damage, supplier invoice, and received cost. Attachments such as invoices, delivery receipts, official receipts, photos, quotations, and PO PDFs are retained through approved storage paths and access controls.

## 6. Inventory

Inventory is batch based and valued FIFO only. Every accepted receiving line creates one or more inventory batches. Every issue consumes the oldest eligible batch first, subject to quarantine, expiry, and availability rules. Inventory balances are query projections; the immutable movement ledger is the audit source of truth.

Negative inventory is permitted to avoid blocking authorized operations. It is always visible, costed provisionally, flagged for reconciliation, and reported to management. No user may hide, delete, or silently overwrite a negative position.

## 7. Inventory Consumption

All consumption types use one shared engine: Sale, Staff Consumption, Recipe Trial, Research and Development, Waste, Spoilage, Internal Use, Production, Transfer, and Adjustment. A request identifies organization, store, ingredient, quantity/unit, reference, actor, time, optional shift, notes, and idempotency key.

The engine normalizes quantity to the ingredient base unit, applies FIFO, creates controlled negative allocations when needed, updates a balance projection, creates immutable stock movements, classifies costs, records audit data, and emits domain events. Feature modules must request consumption; they must not deduct batches independently.

## 8. Staff Consumption

Staff consumption may use an unchanged standard recipe, a modified recipe, or a fully custom ingredient list. The posted record preserves the standard recipe requirement and actual ingredient list separately. Additions, removals, substitutions, increases, and reductions are structured line items, never hidden in notes.

Actual ingredients consume through the shared engine. The record stores FIFO allocations, negative allocations, standard cost, actual provisional cost, variance, reason, and approval. Staff consumption creates no customer revenue and is never classified as customer-sale COGS.

## 9. Research and Development

R&D is managed through projects and named trials. Every trial has a unique immutable trial number and a required human-readable trial name. It captures objective, hypothesis, product concept, recipe/draft-version link, actual ingredients, yield, rejected yield, waste, packaging cost, evaluation, result, and approval.

Trial consumption is posted through the shared engine as Research and Development or Recipe Trial cost. Trial cost is not customer COGS. Trial names remain searchable and are editable only while a trial is draft. Approval or rejection preserves the original trial record and its ingredient history.

## 10. Accounting

FIFO allocations create confirmed cost. Negative allocations create estimated/provisional cost until reconciliation. COGS is recognized from the immutable sale snapshot and must distinguish confirmed cost from estimated negative cost. Supplier liabilities are governed by approved payment terms and invoice matching. Expenses require a defined classification and supporting business document.

## 11. Negative Inventory

Negative inventory is allowed, does not block an authorized business transaction, and is never invisible. The system consumes all eligible FIFO stock, records the shortage as a negative allocation, determines cost from latest batch cost, standard cost, last purchase cost, or no available cost, and flags reconciliation.

Management reporting must expose negative quantity, provisional cost exposure, triggering transaction, first negative date, branch, and reconciliation status. A later receipt or count may reconcile the balance, but must not rewrite original consumption history.

## 12. Audit

Posted inventory and financial records are immutable. Normal operation does not delete movements, batches, receipts, orders, or approvals. Reversals are compensating records linked to the original transaction and require actor, reason, authorization, timestamp, and reference.

Audit records include user tracking, approval history, before/after balances where applicable, event correlation IDs, idempotency keys, and supporting document references. Every audit trail must be sufficient for a manager, owner, or auditor to reconstruct what occurred.

## 13. Security

Cashiers may perform authorized sales consumption, view limited branch availability, and close only their own shift. Supervisors may perform assigned operational actions. Managers may receive goods, post staff consumption, waste and spoilage, stock counts, ordinary reconciliation, and authorized branch reversals. Owners/Admins have full organization authority, cross-branch reporting, and sensitive adjustment approval. Head Office has organization-wide reporting and master-data authority but no branch recipe override mechanism.

Permissions are enforced server-side through Firebase rules and claims. Client routes and hidden buttons are not security controls. Sensitive action permissions include sales write, finance write, procurement manage, procurement receive, recipe manage, recipe publish, and identity manage.

## 14. Reporting

ABP reporting supports branch/date filtering where meaningful. Operational reports include shifts, transactions, and current readiness. Financial reports include revenue, COGS, payables, payments, and expense classifications. Inventory reports include batches, FIFO valuation, movement ledger, negative inventory, reconciliation, waste, spoilage, and traceability.

Procurement reports cover supplier spend, purchase status, receiving, and open liabilities. R&D reports cover project cost, trial usage, yield, waste, approved/rejected trials, and product concepts. Staff reports cover consumption by employee, modified items, added ingredients, and standard-versus-actual cost.

## 15. Domain Events

Implemented and planned events include: InventoryConsumptionRequested, InventoryConsumed, NegativeInventoryCreated, StockMovementRecorded, InventoryReconciled, ConsumptionReversed, SaleInventoryConsumed, StaffConsumptionPosted, ResearchProjectCreated, RecipeTrialStarted, RecipeTrialPosted, TrialInventoryConsumed, RecipeTrialApproved, RecipeTrialRejected, WasteRecorded, SpoilageRecorded, ShiftOpened, ShiftClosed, PurchaseOrderSubmitted, GoodsReceived, and InventoryBatchCreated.

Events identify aggregate, actor, branch, occurred time, reference, correlation ID, and immutable payload summary. Event consumers must be idempotent.

## 16. Coding Principles

ABP uses feature-first organization, repository interfaces, Firebase adapters, and application-layer use cases. React components must not call Firestore directly or implement business calculations. User-controlled data is validated through Zod or an equivalent schema before posting.

Transactions are used for concurrent balance, batch, idempotency, and ledger writes. Idempotency keys prevent duplicate postings. Tests cover pure business rules and should be extended with Firebase Emulator tests for permissions and transactions. No feature may create an alternate FIFO or inventory deduction implementation.

## 17. Future Roadmap

Version 1 establishes POS, recipes, procurement, shifts, FIFO, and operational controls. Version 2 adds complete inventory consumption, reconciliation, reports, supplier settlement, and offline queueing. Version 3 adds advanced manufacturing, multi-warehouse transfers, franchise tooling, and enterprise analytics.

Future capabilities include AI-assisted forecasting, franchise compliance, manufacturing/commissary workflows, CRM/loyalty maturity, HR scheduling, maintenance, and business intelligence. Each must follow this Rule Book.

## Appendix A. Glossary and Abbreviations

- **ABP**: Accaza Business Platform.
- **COGS**: Cost of Goods Sold.
- **FIFO**: First In, First Out valuation and allocation method.
- **PO**: Purchase Order.
- **GRN/Goods Receipt**: Confirmation of goods received and accepted.
- **Batch**: A traceable inventory lot with a cost, quantity, source, and dates.
- **Projection**: A query-optimized balance derived from immutable ledger events.
- **Reconciliation**: An authorized adjustment resolving physical versus recorded stock or provisional cost.

## Appendix B. Collection Naming

Collections use lower camel case plural nouns: `suppliers`, `purchaseOrders`, `goodsReceipts`, `inventoryBatches`, `inventoryBalances`, `stockMovements`, `negativeInventoryAllocations`, `staffConsumptions`, `recipeTrials`, `wasteRecords`, `spoilageRecords`, `domainEvents`, and `idempotencyRecords`. Documents carry organization/store scope when operational, audit metadata, and explicit status.

## Appendix C. Document Numbering

Business document numbers are readable, stable, collision-resistant, and store aware. Examples: `PO-MAIN-20260731-000042`, `GRN-MAIN-20260731-000018`, `BATCH-MAIN-20260731-000018-01`, `RDT-2026-0042`, `SC-MAIN-20260731-000007`, and `ADJ-MAIN-20260731-000003`. System IDs remain immutable implementation identifiers and are never replaced by display numbers.

## Appendix D. Business Examples

- A Purchase Order is approved, received against its invoice, and creates batches only for accepted quantity.
- A Goods Receipt records 10 kg ordered, 9.5 kg accepted, and 0.5 kg damaged; only 9.5 kg becomes FIFO stock.
- An Inventory Batch retains its supplier, receipt, cost, expiry, and remaining quantity until depleted or reconciled.
- A Recipe Trial named “Spanish Latte — Reduced Sweetness Test” consumes actual ingredients and stores its result independently of production recipes.
- A Staff Consumption record stores both the standard latte recipe and the actual added syrup or milk substitution.
- A Stock Adjustment creates an explicit reconciliation movement; it never edits the prior consumption record.
# Product catalog rules

- Product codes are immutable and never reused.
- Referenced categories and products are deactivated, never deleted.
- Active variations require one default variation.
- Price changes are effective-dated records; historical sales retain snapshots.
- Product catalog services do not calculate recipe cost or deduct inventory.
