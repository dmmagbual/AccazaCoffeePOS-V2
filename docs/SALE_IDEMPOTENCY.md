# Sale Idempotency

The sale command stores the request hash, status, lease expiry, and result snapshot under the organization-scoped key. A completed matching retry returns its original result; a changed request using the same key is rejected. An expired `CLAIMED` lease is reclaimable by the same transaction path.
