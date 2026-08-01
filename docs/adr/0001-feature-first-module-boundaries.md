# ADR-0001: Feature-first module boundaries

**Status:** Accepted

**Date:** 2026-08-01

## Context

ABP contains independent business capabilities with shared domain and Firebase
infrastructure. Earlier additions use a mixture of feature-local and cross-feature
files, increasing coupling risk.

## Decision

New work belongs under `src/features/<capability>` with domain, validation,
application/service, infrastructure/repository, and presentation boundaries as
needed. `src/shared` contains only genuinely reusable primitives; `src/application`
coordinates cross-feature use cases. Features may not import another feature's UI.

## Consequences

- Ownership and lazy route boundaries are clearer.
- Cross-feature coordination must use explicit contracts, adding a small amount of
  ceremony.
- Existing modules migrate incrementally; no broad move is performed as part of
  this audit.
