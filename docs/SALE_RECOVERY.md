# Sale Recovery

Live sale claims cannot be taken while their lease remains valid. Expired claims are retried with the original request hash, and transaction atomicity prevents committed inventory or financial evidence without the sale record. The rollback emulator suite proves a stale claim can complete exactly once after its lease expires.

Recovery still needs an execution owner, a structured recovery audit record, retention/cleanup policy, and a live contention test before P4-002 closure.
