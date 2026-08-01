# Sale Snapshots

Tax is embedded in each immutable order line as `taxSnapshot` and represented in receipt lines by the persisted tax amount. The same order line stores product, category, variation, recipe, and option snapshots. Finance and loyalty links live on the sale header; inventory references are represented by immutable stock movements. No standalone tax snapshot collection exists, preventing duplicate authoritative tax evidence.
