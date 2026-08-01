# Error Handling Standard

Domain services throw concise validation/authorization/conflict errors. Application layers translate them into typed outcomes for UI. Do not expose Firebase internals or sensitive tenancy data in UI errors. Recoverable persistence failures must retain user work.
