# Sale Emulator Testing

Run `npm run emulators:test`. It starts Auth, Functions, and Firestore emulators, then verifies authenticated callable resolution, catalog/recipe/tax/payment validation, negative inventory, Finance, loyalty earn/redemption, shift totals, idempotency, rollback, immutable history, and client security/read contracts. The current audit run could not start this command because port 8080 was already occupied; rerun after the existing Firestore emulator stops.

`functions/tests/historical-snapshots.test.mjs` is the P4-002G callable audit. It normalizes Firestore timestamps and compares persisted evidence before and after live configuration changes, including a completed idempotency replay.
