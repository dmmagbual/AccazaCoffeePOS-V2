# Backup and Recovery

No automated backup is implemented by this repository. Before pilot, configure
scheduled Firestore exports, validate restore in a separate project, and document
the Storage backup location and retention. Protect environment configuration in a
secret manager, never Git.

The pilot recovery priority is: identities and permissions, master data, posted
financial and sales records, inventory batches/movements, then attachments and
analytics projections. Set and test a business-approved RPO and RTO before go-live.
