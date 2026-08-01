# Observability

The browser emits structured, non-sensitive application events with a correlation
ID through `shared/services/observability`. The error boundary displays that ID to
support staff without exposing stack traces. Console output is a pilot foundation,
not durable monitoring.

Before pilot, route server-command failures, rule denials, migration results, and
projection rebuild state to a protected operational log. Alert on repeated command
failures, denied requests, and unreconciled inventory; never log payment references,
customer PII, or credentials.
