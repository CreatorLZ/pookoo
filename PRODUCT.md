# ConfigIQ Product Specification & Requirements

> **Product Definition for the ConfigIQ Configuration Reasoning Engine.**

---

## 1. Problem Statement

Developers spend countless hours deciphering application configuration. In modern codebases, configuration is fragmented across `.env` files, framework configs (`next.config.js`, `vite.config.ts`, `tsconfig.json`), container specifications (`Dockerfile`, `docker-compose.yml`), and application code calls (`process.env.VAR_NAME`).

This fragmentation creates severe friction:
1. **Implicit Dependencies**: Developers cannot easily identify which code paths break when an environment variable is removed or changed.
2. **Dead Configuration**: Obsolete variables persist in `.env.example` files long after their source code usages were deleted.
3. **Security Leaks**: Secrets intended strictly for backend execution are accidentally exposed via public framework prefixes (`NEXT_PUBLIC_`, `VITE_`).
4. **Lack of Documentation**: Required variables lack type signatures, description comments, or fallback default documentation.
5. **Slow Onboarding**: New developers spend days asking senior engineers why specific configuration variables exist.

---

## 2. Target Personas & User Journeys

### Persona A: Alex (Senior Full-Stack Engineer)
* **Goal**: Refactor a legacy monorepo and remove obsolete environment variables.
* **Journey with ConfigIQ**:
  1. Alex runs `configiq scan .` in the terminal.
  2. ConfigIQ parses all `.env`, `docker-compose.yml`, and TypeScript files, generating a Knowledge Graph.
  3. ConfigIQ flags 14 `UNREFERENCED_ENV_VAR` findings (dead configuration).
  4. Alex reviews the remediation output and confidently deletes the dead variables without fear of dynamic runtime breakages.

### Persona B: Priya (DevOps / Security Auditor)
* **Goal**: Ensure no sensitive credentials leak to client-side bundles in a Next.js application.
* **Journey with ConfigIQ**:
  1. Priya integrates `configiq scan --fail-on=high` into CI/CD workflows.
  2. A pull request introduces `NEXT_PUBLIC_STRIPE_SECRET_KEY`.
  3. ConfigIQ flags a `PUBLIC_PREFIX_SECRET_RISK` Finding with `CRITICAL` severity and fails the CI build before deployment.

---

## 3. Core Features (V1 Scope)

### F1: Multiformat Configuration Item Discovery
Automatically parses and extracts Configuration Items from:
- `.env`, `.env.example`, `.env.local`, `.env.production`
- `docker-compose.yml`, `Dockerfile`
- `package.json`, `tsconfig.json`
- Framework files (`next.config.js`, `vite.config.ts`)

### F2: Static Code Call-Site Mapping (Usage Mapping)
Scans source files (`.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs`) using AST parsing to locate all accessors:
- Direct properties: `process.env.DATABASE_URL`
- Destructured access: `const { PORT, HOST } = process.env`
- Dynamic string indexing: `process.env[varName]` (flagged as dynamic reference)
- Utility wrappers: `config.get('PORT')`, `env('PORT')`

### F3: Framework Heuristic Detection
Detects repository frameworks and applies implicit rules:
- **Next.js**: `NEXT_PUBLIC_` public prefix rules, `serverRuntimeConfig`, `publicRuntimeConfig`.
- **Vite**: `VITE_` public prefix rules, `import.meta.env`.
- **Express / Node.js**: Standard `process.env` resolution.

### F4: Deterministic Rule Engine & Health Score
Evaluates the graph against built-in rules (see [GLOSSARY.md](GLOSSARY.md)):
- `NO_UNREFERENCED_ENV_VAR`: Detects dead configuration.
- `UNDOCUMENTED_REQUIRED_VAR`: Detects required variables lacking schema or documentation.
- `PUBLIC_PREFIX_SECRET_RISK`: Detects potential secret keys exposed via public framework prefixes.
- `FALLBACK_INCONSISTENCY`: Identifies inconsistent default values across multiple call-sites for the same variable.
- Calculates an overall repository **Health Score** (0.0 to 100.0).

### F5: Rich Terminal & Markdown Reporter
Renders findings into terminal ANSI reports (with summary tables, call-site snippets, and remediation tips) or standalone Markdown reports (`CONFIG_REPORT.md`).

---

## 4. Out of Scope (Explicit Non-Goals)

To preserve product focus, ConfigIQ explicitly excludes:
- ❌ **Secret Management / Cloud Vault Storage**: Storing or encrypting secret keys in the cloud.
- ❌ **Runtime Secret Injection**: Overriding `process.env` at dynamic runtime in production containers.
- ❌ **Dotenv Syncing Services**: Pushing `.env` files to team members over HTTP/SaaS portals.
- ❌ **Database State Persistence**: No PostgreSQL, MongoDB, or Redis databases.

Refer to [ANTI_GOALS.md](ANTI_GOALS.md) for full boundaries.

---

## 5. Future Features (V2+ Roadmap)

- **Interactive Visual Graph (HTML / Webview)**: Render the Knowledge Graph as an interactive D3/Mermaid DAG visualizer.
- **VS Code Extension**: Real-time inline call-site annotations and hover documentation explaining why an environment variable exists.
- **GitHub Action Guardrails**: Automated PR commenting and threshold checks.
- **Multi-Language AST Parsing**: Python (AST), Go (go/parser), Rust (syn), Java (javaparser).

---

## 6. Success Metrics & Product Goals

| Metric | Target (V1) | Measurement Method |
| :--- | :--- | :--- |
| **Scan Speed** | `< 2.0s` for 50,000 LOC repository | Benchmark suite in `@configiq/scanner` |
| **Parsing Accuracy** | `> 99%` accuracy on standard process.env call-sites | Vitest integration test suite |
| **Zero False Positive Secrets** | `< 1%` false positive rate on secret risk findings | Rule evaluation verification |
| **Developer Onboarding** | Reduced time to configuration comprehension | User study feedback |
