# ADR-0003: Immutable financial and operational records

**Status:** Accepted

**Date:** 2026-08-01

## Context

Sales, payments, stock movements, recipe versions, and finance postings must be
auditable and must not be silently rewritten after completion.

## Decision

Completed operational events are append-only. Corrections are represented by
reversal, adjustment, void, or a new version that references the original event.
Commands that write related records use a transaction/server boundary and retain a
snapshot of prices, recipe versions, and actor metadata.

## Consequences

- Historical reporting remains reproducible.
- Correction flows require deliberate domain design.
- Firestore rules must be strengthened and emulator-tested before these paths are
  production-enabled.
