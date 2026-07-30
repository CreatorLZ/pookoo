# Pookoo Domain Glossary

All specifications, docs, and code must use these terms consistently.

### 1. Configuration Item (CI)

A single configuration declaration in a repository. Represents an environment variable (`DATABASE_URL`), a config file property (`server.port`), a framework key (`images.domains`), or a container binding. Has `key`, `sourceLocation`, `defaultValue`, `isRequired`, `typeSignature`, `inferredFramework`. Not a runtime secret value.

### 2. Scanner

The deterministic static analysis pipeline: ingests a repo filesystem, builds ASTs, detects frameworks, discovers Configuration Items, maps code usages, builds a Knowledge Graph, and runs Rules. Implemented as `@pookoo/scanner`. Pure, stateless, zero side effects.

### 3. Usage (Call-site Mapping)

A reference or read operation in source code targeting a specific Configuration Item. Has `filePath`, `lineNumber`, `columnRange`, `accessorPattern` (e.g. `process.env.FOO`), `callType`.

### 4. Rule

A deterministic evaluation contract that inspects the Knowledge Graph to find configuration issues. Examples: `NO_STATIC_REFERENCE_FOUND`, `UNDOCUMENTED_REQUIRED_VAR`, `PUBLIC_PREFIX_SECRET_RISK`, `FALLBACK_INCONSISTENCY`.

### 5. Finding

An actionable diagnostic emitted when a Rule condition fails. Has `id`, `ruleId`, `severity` (CRITICAL/HIGH/MEDIUM/LOW/INFO), `targetKey`, `message`, `explanation`, `remediation`.

### 6. Knowledge Graph

A directed acyclic graph (DAG) of relationships between Configuration Items, call-sites, files, and schemas. Nodes: `ConfigurationItemNode`, `SourceFileNode`, `CallSiteUsageNode`, `SchemaNode`. Edges: `DECLARES`, `READS_FROM`, `VALIDATES`, `DEFINES_FALLBACK`.

### 7. Health Score

An internal, pending-calibration composite metric (0.0-100.0) quantifying configuration clarity, documentation coverage, and structural hygiene. Calculated from severity-weighted findings per ADR-006. Currently non-authoritative.

### 8. Framework Heuristic

Pattern-matching rules that detect active frameworks (Next.js, Vite) and extract their implicit configuration behavior (e.g. `NEXT_PUBLIC_` prefix rules).

### 9. Reporter

Output transformation module in `packages/scanner/src/reporter`. Renders the Knowledge Graph and Findings into Terminal ANSI, Markdown, or JSON formats.

### 10. Deterministic Analysis

Static code analysis using AST parsing, grammar matching, and graph traversal. 100% reproducible results for the same source tree. No LLM calls or non-deterministic heuristics.
