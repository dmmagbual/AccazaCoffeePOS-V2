# Server Runtime Boundaries

Only `functions/` and `server/` may import Firebase Admin. Browser `src/` may not import Admin SDK code. Trusted sale, inventory, tax, finance, audit, and outbox writes must execute through authenticated server commands; this foundation does not expose CompleteSale.
