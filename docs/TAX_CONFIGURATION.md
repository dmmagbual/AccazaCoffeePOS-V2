# Tax configuration

Tax is configured by organization in `taxProfiles`; a profile contains immutable, effective-dated rate versions. Rates are controlled decimal strings from `0` through `1` with no more than six decimal places. Monetary calculation inputs are integer currency minor units, so calculations do not depend on binary floating-point arithmetic.

Resolution is centralized: an authorized transaction override, product or variation, product category, branch default, then organization default. A branch profile must explicitly include the branch. The resolver rejects ambiguous effective versions and rejects overlapping rate periods when a new version is scheduled.

Completed transactions must retain `TaxSnapshot` data: profile/version identity, type, rate, calculation mode, tax bases, tax amount, inclusive/exclusive values, exempt/zero-rated values, rounding adjustment, and calculation time. Refunds and reporting must use that snapshot, never a currently active version.

Tax profile changes require `tax.manageProfiles` or `tax.changeRates`; viewing requires `tax.view`. Account mappings are profile configuration, not hardcoded account identifiers. Legacy order records only have aggregate tax totals and no recoverable profile snapshot; migration must report them as incomplete rather than invent historical tax detail.
