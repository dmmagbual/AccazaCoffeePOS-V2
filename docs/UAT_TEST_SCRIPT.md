# Owner / Store Manager UAT Script

Use a non-production test organization. Do not enter real customer, employee, tax, or payment data until each blocking gap is closed.

| Scenario | Preconditions | Actions | Expected result | Pass / Fail | Notes | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| Business setup | Empty test organization | Open `/setup`; complete business, branch, tax, owner, and review steps; initialize once; retry. | Validation prevents incomplete data; retry is idempotent; no tax rate is prefilled. |  |  |  |
| Category | Authorized owner and persistent catalog feature delivered | Settings → Categories; create Coffee Based; edit description; reorder; deactivate. | Save is audited; category is scoped, shown/hidden in POS as configured, and never destructively deleted. |  |  |  |
| Menu item | Category, tax profile, recipe, and image available | Create an 12 oz Spanish Latte with code, price, category, recipe, POS visibility, branch and active state. | Product persists; active/available branch sees it in POS; inactive/unavailable branch does not. |  |  |  |
| Options | Product and ingredients available | Create Extra Espresso Shot and Vanilla Syrup options with price and structured ingredient effects. | Selection rules, max quantity, defaults, order, branch scope, and active state save. |  |  |  |
| Ingredient | Authorized owner | Create ingredient without posting stock; set unit, cost, shelf life, batch tracking, reorder level, storage class; deactivate it. | No inventory quantity is created; history is retained; inactive ingredient is rejected in a new recipe version. |  |  |  |
| Opening inventory | Approved opening inventory feature delivered | Create, review, approve, post, and reverse a dated opening batch. | Atomic batch/balance/movement result; no AP; reversal is traceable. |  |  |  |
| Supplier receiving | Supplier, PO, and ingredient present | Receive a PO with accepted/rejected quantities, batch, expiry, invoice reference. | Batches/costs are correct; supplier invoice remains unpaid. |  |  |  |
| Recipe | Ingredient and product present | Create draft, add lines/yield/waste/steps, save, publish, then clone a new version. | Published version remains immutable; only one effective version applies. |  |  |  |
| Tax | Finance-authorized user | Create profile, rate/version, inclusive/exclusive mode, mappings, branch scope; future-date a rate. | Overlap is rejected; cashiers cannot edit; historic sale snapshot does not change. |  |  |  |
| Cash sale | Open shift, stocked product, tax profile | Sell Spanish Latte; complete cash payment. | Receipt, sale/tax/recipe snapshots, FIFO allocations, COGS, stock movement, shift totals, and audit event are created. |  |  |  |
| Modified sale | Same as cash sale | Select Extra Espresso Shot and Vanilla Syrup. | Price, tax, receipt, recipe snapshot, ingredient use, FIFO cost, and BI metrics include options. |  |  |  |
| Shift close | Completed test sales | Count actual cash; close shift; review variance and settlement. | Expected cash, tender totals, variance, and settlement are immutable and idempotent. |  |  |  |

**Do not mark a row passed based solely on a page rendering.** Record the resulting document IDs, receipt number, screenshots, and any trusted-command/audit evidence.
