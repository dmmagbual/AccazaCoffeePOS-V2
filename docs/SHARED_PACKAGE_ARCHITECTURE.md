# Shared Package Architecture

`@abp/inventory-consumption` is a local workspace package used by both the root application and Firebase Functions. It contains pure inventory contracts and consumption logic only; Firebase, UI, and persistence remain outside the package. P4-002B.1 must now replace the sale-local allocator with this dependency.
