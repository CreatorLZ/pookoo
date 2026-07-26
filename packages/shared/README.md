# @configiq/shared

> **Shared primitive types and domain models for ConfigIQ.**

This package contains the TypeScript interfaces and utility types that form the domain language of ConfigIQ.

## Responsibilities
- Define core interfaces: `ConfigurationItem`, `Usage`, `Finding`, `RuleDefinition`, `KnowledgeGraph`.
- Define shared constants (e.g., Severity levels, finding IDs).
- Provide minimal, dependency-free utility functions used across `scanner` and `cli`.

## Dependencies
- Zero runtime dependencies.
- This package must never import from `@configiq/scanner` or `@configiq/cli`.
