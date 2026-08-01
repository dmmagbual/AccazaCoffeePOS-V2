# Storage Locations

Each branch has exactly one active default location. Idempotent provisioning returns an existing default or creates `MAIN` / `Main Storage`. Existing batches without a location remain valid and resolve operationally to that default; historical documents are not rewritten.

The hierarchical model supports future warehouse zones through bins while current simple storage remains one level deep. Locations are deactivated, never deleted.
