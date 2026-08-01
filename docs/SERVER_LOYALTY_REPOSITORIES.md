# Server Loyalty Repositories

The Functions-only loyalty boundary resolves active customers and programs, maintains integer-point balances transactionally, and creates deterministic sale/type transaction IDs. Program earn and redemption rules are read from configuration; no points rule is hardcoded. Sale completion does not invoke this infrastructure until P4-002C.1.
