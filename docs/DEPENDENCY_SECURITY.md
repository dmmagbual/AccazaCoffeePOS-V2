# Dependency Security

Run `npm audit --omit=dev` before release. P4-002C.0 introduced no new runtime dependency; Firebase Admin and Functions remain the existing server-runtime dependencies. No automatic or breaking audit fix has been applied.

## 2026-08-02 runtime audit

`npm audit --omit=dev` reported **11 vulnerabilities**: **2 high** and **9 moderate**.

- `react-router` 7.12.0–8.2.0: high-severity RSC-mode CSRF bypass advisory (`GHSA-qwww-vcr4-c8h2`).
- Transitive `uuid` below 11.1.1: moderate buffer-bounds advisory (`GHSA-w5hq-g745-h8pq`) through Firebase/Google client dependencies.

The offered full remediation is `npm audit fix --force`; it proposes a breaking React Router downgrade and Firebase Admin change. It was deliberately **not** applied during this documentation-only audit. The runtime dependency owners must assess compatible non-breaking upgrades before pilot deployment.
