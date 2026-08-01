# Sale Emulator Testing

Run `npm run emulators:test`. It starts Auth, Functions, and Firestore emulators, then verifies transaction cleanup and server Finance, Loyalty, and shift persistence. A fully seeded catalog-to-callable sale matrix remains required before pilot closure.

`functions/tests/historical-snapshots.test.mjs` is the P4-002G callable audit. It normalizes Firestore timestamps and compares persisted evidence before and after live configuration changes, including a completed idempotency replay.
