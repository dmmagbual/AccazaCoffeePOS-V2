# Server Journal Posting

`JournalRepository` uses the deterministic identifier `SALE-{saleId}` and Firestore `transaction.create`. It rejects unbalanced entries and makes posted entries immutable. Corrections must be represented by a future reversing journal; clients have no write permission.
