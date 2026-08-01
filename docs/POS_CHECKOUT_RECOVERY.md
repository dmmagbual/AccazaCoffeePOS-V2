# POS Checkout Recovery

The POS creates an idempotency key only when it submits a payment attempt. The
same local attempt fingerprint reuses that key for retry. Network failures are
classified as `UNCERTAIN`, not success: the cart remains intact and the UI says
that the prior payment attempt is being checked.

After a refresh, the POS invokes the authenticated `getSaleAttempt` callable
with the persisted key and requested branch. A completed result clears the cart
and retains only the server identifiers for support/reprint; pending attempts
remain blocked until their trusted result is known. The browser does not create
a replacement sale, receipt, payment, or stock movement during recovery.

The recovery record deliberately excludes raw payment references and all card
or finance metadata. The stored fingerprint is a one-way local comparison aid,
not authoritative data or a security credential.
