# Production Batches

Completing an in-progress order creates a unique production batch containing the order, recipe, recipe version, operator, shift, production date, expiry date, original quantity, remaining quantity, total cost, and unit cost. This gives downstream sale and recipe-consumption workflows an immutable traceability anchor.

Semi-finished output batches are inventory and can later be issued through the same unified consumption engine. Automatic sale-to-batch deduction is intentionally owned by the inventory-consumption integration, not the production UI.
