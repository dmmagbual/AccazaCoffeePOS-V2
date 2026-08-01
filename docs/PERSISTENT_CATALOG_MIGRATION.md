# Persistent Catalog Migration

Static `products.json` is no longer a production runtime source. A future trusted migration command must accept it only as input and support dry-run, preview, validation report, category/code duplicate detection, deterministic product-code mapping, price/image mapping, and idempotent non-destructive writes.

It must create audit evidence and emit `StaticCatalogMigrated` only after all records validate. It must never overwrite a catalog record with transaction history. Do not run a migration automatically against production data.
