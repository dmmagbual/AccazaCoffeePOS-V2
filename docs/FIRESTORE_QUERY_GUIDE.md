# Firestore Query Guide

## Scope and required filters

Operational queries must be built in repositories, never in React components. Every
store-owned query begins with `organizationId` and `storeId`; organization master
data begins with `organizationId`. Repositories must apply those filters before
optional status, date, category, supplier, or cursor filters.

Do not query a collection and filter its results in the browser. This bypasses
tenant boundaries, scales poorly, and can conceal missing indexes.

## Pagination and ordering

Use a stable server-side order (normally `createdAt` descending, followed by the
document id where needed), a bounded page size, and cursor pagination. A caller
must explicitly request a wider time range rather than loading an unbounded
history. Dashboard aggregates should come from an analytics provider or a
materialized aggregate, not by downloading transactional records.

## Index lifecycle

`firestore.indexes.json` is the source-controlled record of approved composite
indexes. Add an index only after a repository query exists and its tenant scope,
order, expected cardinality, and retention implications are reviewed. The current
file covers core sales, product, inventory, procurement, audit, and production
queries; later feature queries require an index review before Firebase-backed
repositories are enabled.

## Transactions and idempotency

Use Firestore transactions or a server-side command boundary for writes that
affect multiple documents: completing a sale, receiving stock, FIFO consumption,
publishing a recipe, closing a shift, or posting finance entries. Each command
needs an idempotency key and must preserve the original user input until confirmed
success. Never use a client-generated retry to create an additional financial or
inventory record.

## Rule alignment

Security rules enforce access, but are not a substitute for repository filters.
Each new collection requires all three before release: a typed repository query,
the matching composite index if needed, and emulator tests proving tenant and role
isolation.
