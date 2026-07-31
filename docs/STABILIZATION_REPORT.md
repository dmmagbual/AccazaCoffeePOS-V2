# Stabilization Report

## Issues found and fixed

- No test framework or test command existed. Vitest now runs focused financial, payment, recipe, operational snapshot, persistence-failure, and duplicate-submission tests.
- Ingredient update schema construction failed at module load because Zod does not allow `partial()` on a refined schema. The base object schema is now separated from the refined create schema.
- No application-level error boundary existed. A contained recovery screen now prevents a full blank application on unexpected render errors.
- Generic Firestore writes overlapped payment, receipt, expense, cash-drawer, and order paths. Generic writes now exclude those collections, which have dedicated finance/sales permissions.
- POS now supports `/` to focus product search, `Ctrl+Enter` to open checkout safely, clear-cart confirmation, and existing checkout progress/error/success feedback.

## Coverage summary

The Vitest suite covers cart totals, fixed and percentage discounts, tax, cash change, split payment totals, compatible/incompatible unit conversion, recipe costing, active recipe snapshot construction, successful cash sale, underpayment, persistence failure, and duplicate submissions. Browser/UI integration and Firestore Emulator rules tests remain future work.

## Performance findings

Routes are lazy-loaded. Existing filters and product/category maps already use targeted memoization. The sales chunk remains relatively large because it includes Firebase batch persistence; future work should dynamically load Firebase persistence only when Firebase is configured. No broad list virtualization is needed at current local-data sizes.

## Security findings

No secrets are committed; Firebase configuration is environment-backed. React components do not import Firestore directly. Organization/store scope and immutable audit fields remain enforced by rules. Financial writes require `finance.write`, orders require `sales.write`, and recipe publishing remains restricted by `recipes.publish`. Rules should next be exercised in the Firebase Emulator with real custom claims.

## Remaining technical debt and next steps

- Add Firebase Emulator security and persistence integration tests.
- Add browser-level POS tests for keyboard shortcuts and recoverable checkout errors.
- Implement authenticated organization/store/cashier context instead of local development identifiers.
- Add an idempotent encrypted offline sale queue before production offline support.
- Split the Firebase persistence adapter into a dynamic import to reduce the sales bundle.
