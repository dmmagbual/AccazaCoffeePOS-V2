# Security Audit — P1

Firestore and Storage rules now default to deny and explicitly scope selected
collections. Financial, inventory, audit, approval, and workflow evidence is
browser-write denied pending trusted server commands. Gaps remain: no emulator rule
suite, no authenticated route guards, and no deployed command layer. Treat
client-side permission checks as UX only.
