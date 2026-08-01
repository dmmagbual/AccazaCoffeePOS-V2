# Business Setup Wizard

The Business Setup Wizard guides a first installation through business profile,
Head Office organization, first branch, taxes, units, categories, chart of
accounts, payment methods, enabled features, owner account, review, and
initialization. It supports a single store now and preserves organization/branch
boundaries required by future multi-branch and franchise use.

## Validation and seeds

Business identity, branch code, address, timezone, tax rate, owner email, and a
minimum 12-character owner password are validated with Zod. Seeds reuse the
standard-unit registry, default coffee-shop chart, feature registry, and requested
category/payment lists. No products, recipes, inventory, customers, or demo sales
are created.

## Resume, idempotency, and rollback

The browser keeps a resumable draft but strips owner passwords before storage.
Initialization has a stable idempotency key and never overwrites an existing plan.
Restart removes only the uncommitted local plan. A trusted server setup command is
required before this plan can create Firebase records, roles, audit logs, or owner
credentials; this is intentional under P2's browser-write restrictions.

## Settings and configuration center

After initial setup, `/settings` is the permanent categorized configuration center.
It links to the existing Product, Ingredient, Recipe, Finance, HR, Master Data,
and Platform Configuration feature APIs. The wizard uses the same unit, chart, and
feature services; it does not create parallel business records. Navigation is not
authorization: trusted services and Firestore rules remain the enforcement layer.
