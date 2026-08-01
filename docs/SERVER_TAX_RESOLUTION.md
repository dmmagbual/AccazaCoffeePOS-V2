# Server Tax Resolution

The resolver selects effective tax in this priority: option, variation, product, category, branch, then organization default. It reads `taxProfiles`, `taxConfigurationVersions`, and `taxAssignments`; it never accepts a client rate.
