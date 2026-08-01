# Migration Runbook

## Prerequisites

- A tested Firebase project, least-privilege service account, and a verified backup.
- Custom claims: `organizationId`, `storeIds`, `branchIds`, and `permissions`.
- A staging deployment where the rule and migration test suites have passed.

## Order

1. Export Firestore and record the export location and timestamp.
2. Back up Storage object metadata and environment configuration outside source control.
3. Deploy rules in staging; verify deny-by-default and permitted role paths.
4. Create organization, store, branch, role, and custom-claim records idempotently.
5. Load master data, then suppliers/ingredients/recipes, then opening inventory.
6. Enable trusted command endpoints for sales and other ledgers before enabling Firebase-backed writes.
7. Deploy production rules only after a pilot checklist sign-off.

## Verification and rollback

Each migration records a version, actor, start/end time, counts, and failures. It
must support dry-run and retry without duplicate defaults. Do not rewrite posted
records. Roll back by disabling writes, restoring the last validated export to an
isolated recovery project, and reconciling immutable documents; destructive
in-place rollback is prohibited.
