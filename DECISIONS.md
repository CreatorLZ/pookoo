# Architecture Decision Records (`DECISIONS.md`)

> **Record of significant technical and design decisions made in ConfigIQ.**  
> *Rules: Never delete or overwrite past decisions. Superseded decisions must be marked as `SUPERSEDED` with a link to the new ADR.*

---

## ADR-001: pnpm Workspaces & Turborepo Monorepo Architecture

* **Date**: 2026-07-22
* **Status**: 🟩 **ACCEPTED**

### Context
ConfigIQ needs a build toolchain capable of supporting a modular library (`@configiq/scanner`), shared types (`@configiq/shared`), and executable applications (`apps/cli`, future VS Code extensions).

### Alternatives Considered
1. **Single Polyrepo Setup**: Multi-repo setup with published npm packages. (Rejected: High overhead for local development and synchronized versioning).
2. **npm / yarn Workspaces**: Standard workspace setup. (Rejected: Slower caching and dependency resolution compared to pnpm).

### Chosen Solution
Adopt `pnpm` workspaces paired with `Turborepo` for incremental compilation, topological task execution, and intelligent cache invalidation.

### Tradeoffs
- Requires developers to have `pnpm` installed locally.
- Slightly higher initial configuration complexity (`pnpm-workspace.yaml` + `turbo.json`).

---

## ADR-002: Static Analysis First, AI Augmentation Second

* **Date**: 2026-07-22
* **Status**: 🟩 **ACCEPTED**

### Context
Configuration analysis requires absolute accuracy. Dynamic runtime crashes occur when environment variables are missing or misconfigured. 

### Alternatives Considered
1. **LLM-First Scanner**: Passing raw source files directly to an LLM prompt to discover environment variables. (Rejected: Non-deterministic, expensive, rate-limited, prone to hallucinations, cannot work offline).

### Chosen Solution
Build a pure, 100% deterministic static analysis engine using AST parsing (TypeScript Compiler API / SWC, custom Dotenv parser, Yaml parser) and graph algorithms. AI capabilities are strictly deferred to Phase 6 as an optional reasoning synthesis layer over the deterministic graph.

### Tradeoffs
- Requires building and maintaining explicit AST parsers for multiple file formats.
- Parsing complex dynamic indexing expressions (`process.env[computedKey]`) requires fallback handling.

---

## ADR-003: Pure Library Scanner with Internal Submodules (Folders over Packages)

* **Date**: 2026-07-22
* **Status**: 🟩 **ACCEPTED**

### Context
Initial design proposals suggested creating 9 standalone npm packages (`@configiq/parser`, `@configiq/rules`, `@configiq/reporter`, etc.).

### Alternatives Considered
1. **Multi-Package Explosion**: 9 separate packages inside `packages/`. (Rejected: Excessive cross-package linking friction, version sync complexity, premature abstraction).

### Chosen Solution
Keep all analysis subsystems inside **`packages/scanner/src/`** as clean internal folder submodules (`framework-detection`, `variable-discovery`, `usage-mapping`, `parser`, `rules`, `knowledge`, `reporter`). Standalone package boundaries are limited strictly to `@configiq/scanner` and `@configiq/shared`.

### Tradeoffs
- Internal module boundaries must be disciplined via clean TypeScript exports to prevent circular imports.
- Submodules cannot be published independently to npm without future refactoring.

---

## ADR-004: Graph-Based Knowledge Model for Configuration Entities

* **Date**: 2026-07-22
* **Status**: 🟩 **ACCEPTED**

### Context
Configuration items do not exist in isolation. A variable declared in `.env` links to a schema in `schema.ts`, a call-site in `server.ts`, and a container spec in `docker-compose.yml`.

### Alternatives Considered
1. **Flat Key-Value Array**: Storing configuration as a simple list of strings. (Rejected: Unable to model call-site dependencies, fallbacks, or cross-service relationships).

### Chosen Solution
Model all repository configuration entities as an in-memory Directed Acyclic Graph (DAG) Knowledge Graph (`packages/scanner/src/knowledge`). Nodes represent `ConfigurationItem`, `CallSite`, `File`, and `Schema` entities; edges represent `DECLARES`, `READS_FROM`, and `VALIDATES` relationships.

### Tradeoffs
- Graph construction adds minor memory overhead during large repository scans (mitigated by optimized AST visitor traversals).
