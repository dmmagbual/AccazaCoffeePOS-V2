# Inventory Batch Status

The controlled batch-status vocabulary distinguishes available, reserved, in-production, quarantined, expired, damaged, disposed, returned, and depleted batches. Only `AVAILABLE` is normally consumable. Legacy batches without a controlled status remain compatible and consumable under existing FIFO rules.

Expiry is calculated at availability time; a later auditable process may persist confirmed expiry without rewriting historic movements.
