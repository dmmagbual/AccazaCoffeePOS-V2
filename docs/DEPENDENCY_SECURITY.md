# Dependency Security

Run `npm audit --omit=dev` before release. P4-002C.0 introduced no new runtime dependency; Firebase Admin and Functions remain the existing server-runtime dependencies. No automatic or breaking audit fix has been applied.
