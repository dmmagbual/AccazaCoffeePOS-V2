# Accaza Business Platform

ABP is a feature-first React foundation for Accaza Coffee House operations. It is currently development-stage software, not production-ready operational software.

## Structure

- `src/app` — application composition
- `src/layouts` — authenticated shell and navigation
- `src/features` — business capabilities and their public APIs
- `src/application` — cross-feature use cases and operational orchestration
- `src/shared` — reusable UI, hooks, service boundaries, Firebase configuration, router, configuration, and theme

## Commands

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
npm test
```

Initial installations can start at `/setup`. The wizard prepares a validated,
resumable configuration plan; production initialization requires the trusted setup
command described in `docs/BUSINESS_SETUP_WIZARD.md`.

Permanent configuration is organized at `/settings` into Business, Products &
Recipes, Inventory, Finance, People & Access, and System.

The catalog domain documents product hierarchy, variations, pricing, modifiers,
add-ons, combos, availability, and POS layout rules in `docs/MENU_AND_PRODUCT_CATALOG.md`.
