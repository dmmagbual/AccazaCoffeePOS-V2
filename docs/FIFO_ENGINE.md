# FIFO Engine

`consumeFifoBatches` is a pure service. It orders available batches by received date, deducts the requested ingredient quantity across the oldest batches first, marks exhausted batches depleted, and returns exact per-batch costs plus updated immutable batch values. It throws when inventory is insufficient. Recipe and future stock-movement services can reuse this result; this ticket does not perform automatic deductions.
