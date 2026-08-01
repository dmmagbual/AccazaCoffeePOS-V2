# Sale Snapshots

Tax is embedded in each immutable order line as `taxSnapshot` and represented in receipt lines by the persisted tax amount. The same order line stores product, category, variation, recipe, and option snapshots. Finance and loyalty links live on the sale header; inventory references are represented by immutable stock movements. No standalone tax snapshot collection exists, preventing duplicate authoritative tax evidence.

## P4-002G historical audit — verified

`functions/tests/historical-snapshots.test.mjs` completes a real callable sale, then mutates or archives live product, category, variation, option, recipe, tax, payment, customer/loyalty, and Finance configuration. It compares normalized sale, receipt, cashier summary, payment, inventory/COGS, journal, loyalty, audit, outbox, and shift evidence before and after. Completed replay reuses the stored result without mutable catalog resolution.

No historical reader for malformed or missing legacy snapshot documents exists yet. Such documents must remain explicit incomplete/legacy records rather than be repaired from live master data.
