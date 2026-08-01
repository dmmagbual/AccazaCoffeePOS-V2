# Dependency Rules

- Domain: pure TypeScript only.
- Services: domain and repository contracts only.
- Firebase repositories: infrastructure only.
- Pages: consume feature public APIs; never Firestore.
- Cross-feature access: use the owning feature's public `index.ts` or an application use case.
- Immutable ledgers use compensating records, not destructive updates.
