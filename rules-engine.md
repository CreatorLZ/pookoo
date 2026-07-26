# Rules Engine Specification (`specs/rules-engine.md`)

## Purpose
To evaluate the Knowledge Graph and produce actionable `Finding` entities and a `HealthScore`.

## Responsibilities
1. Iterate over registered `RuleDefinition` modules.
2. Provide graph query utilities to rules.
3. Collect rule output arrays.
4. Calculate composite Health Score.

## Standard Rules
- `NO_UNREFERENCED_ENV_VAR`: Flag `ConfigurationItem` nodes with zero incoming `READS_FROM` edges.
- `PUBLIC_PREFIX_SECRET_RISK`: Flag nodes with public prefixes (e.g. `NEXT_PUBLIC_`) containing suspicious strings (`secret`, `token`, `key`, `password`).
- `FALLBACK_INCONSISTENCY`: Flag nodes where connected `Usage` edges define different fallback literals (e.g. `process.env.PORT || 3000` vs `process.env.PORT || 8080`).
