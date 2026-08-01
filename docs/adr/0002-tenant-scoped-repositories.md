# ADR-0002: Tenant-scoped repository access

**Status:** Accepted

**Date:** 2026-08-01

## Context

ABP is multi-organization and multi-store. UI access to Firestore would make
scope omissions and authorization review difficult.

## Decision

All persistence goes through typed repositories. Store-owned documents require
`organizationId` and `storeId`; centrally governed master records require
`organizationId`. Repositories accept an explicit execution context and apply its
scope to reads and writes. React components use services/hooks, not Firebase SDKs.

## Consequences

- Tenant filtering, converters, validation, and error mapping have one reviewable
  boundary.
- Existing local-development adapters can share the same interfaces.
- Rules and emulator tests remain required; repositories do not authorize access.
