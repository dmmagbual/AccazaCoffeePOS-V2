# Procurement Architecture

Procurement is feature-first and organization/store scoped. Supplier Master records central vendor identity and payment terms. Purchase Orders represent supplier delivery, direct walk-in, and online marketplace procurement, with immutable ingredient snapshots and currency/payment-term metadata. Goods Receipts capture the accepted, rejected, and damaged quantities that create inventory batches.

Cashiers have read-only access through Firestore rules. `procurement.manage` controls suppliers and purchase orders; `procurement.receive` controls receiving and batches. Documents are metadata records whose Firebase Storage paths are stored in `purchaseDocuments`; application code should upload binary files through a storage adapter.
