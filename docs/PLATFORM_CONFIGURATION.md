# Platform Configuration

ABP defaults to `SIMPLE_STORAGE`. Feature settings resolve in branch, organization, then platform-default order. Only active, implemented features are enabled by default.

Feature and location changes are intended to be recorded through the existing audit-log boundary. The configuration domain keeps actor, time, scope, and reason fields so no audit schema change is required.
