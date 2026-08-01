# Production Recipes

Production recipes describe manufactured outputs and may consume both raw ingredients and semi-finished products. A recipe version contains its immutable input snapshot, yield, yield unit, and shelf life.

Lifecycle: draft → testing → approved → retired. An approved version must never be edited in place; create a new draft version and approve it before setting it active. Orders retain the exact version identifier used for traceability and historical costing.

An approved R&D result can create a draft production recipe version through an application-layer mapper in a future R&D integration; no data needs to be re-entered.
