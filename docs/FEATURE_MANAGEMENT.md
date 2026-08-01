# Feature Management

The centralized typed registry owns feature names, dependencies, availability, and configuration scope. Dependencies are validated before a feature can be enabled. Disabling a dependency is blocked while a dependent remains enabled.

Planned features are registered disabled and have no routes, preserving a clean current-store experience.
