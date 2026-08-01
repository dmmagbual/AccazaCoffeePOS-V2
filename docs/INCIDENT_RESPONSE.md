# Incident Response

1. Record the correlation ID, time, affected organization/store, and user report.
2. Disable the affected write path if duplicate, financial, inventory, or privacy
   risk is suspected; preserve evidence and do not edit posted records.
3. Determine scope from audit/server logs and verify tenant isolation.
4. Correct with a compensating record or controlled recovery procedure.
5. Document root cause, customer impact, recovery verification, and regression test.

Security incidents require credential/claim review and Firebase rule validation
before the affected capability is re-enabled.
