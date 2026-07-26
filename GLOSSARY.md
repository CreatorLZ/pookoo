# ConfigIQ Core Domain Glossary

This document serves as the canonical domain lexicon for **ConfigIQ**. Every specification, architectural diagram, codebase comment, rule definition, and documentation file must conform to the terminology established here.

---

## Terminology Matrix

### 1. Configuration Item (CI)
* **Definition**: A discrete unit of configuration declaration identified within a repository. A Configuration Item can represent an environment variable (e.g., `DATABASE_URL`), a static file property (e.g., `server.port` in `application.properties`), a framework configuration key (e.g., `images.domains` in `next.config.js`), or a container deployment binding (e.g., `spec.template.spec.containers[].env`).
* **Attributes**: `key`, `sourceLocation`, `defaultValuation`, `isRequired`, `typeSignature`, `inferredFramework`.
* **Non-Definition**: A Configuration Item is NOT a secret value at runtime; it is the structural and semantic declaration of a configuration key.

### 2. Scanner
* **Definition**: The deterministic static analysis pipeline responsible for ingesting a repository filesystem, building an Abstract Syntax Tree (AST) representation, detecting frameworks, discovering Configuration Items, mapping code usages, building a Knowledge Graph, and executing Rule evaluation.
* **Attributes**: Implemented as the root library `@configiq/scanner`. Pure, stateless, headless, and zero-side-effect execution engine.

### 3. Usage (Call-site Mapping)
* **Definition**: An explicit reference or read operation in source code or infrastructure definitions targeting a specific Configuration Item.
* **Attributes**: `filePath`, `lineNumber`, `columnRange`, `accessorPattern` (e.g., `process.env.FOO`, `os.Getenv("FOO")`, `config.get('FOO')`), `enclosingFunction`, `callType` (Direct, Fallback-wrapped, Dynamic Indexing).

### 4. Rule
* **Definition**: A deterministic evaluation contract that inspects the Configuration Items, Usages, and Knowledge Graph to verify configuration health, security, completeness, freshness, and structural integrity.
* **Examples**: `NO_UNREFERENCED_ENV_VAR` (dead config), `UNDOCUMENTED_REQUIRED_VAR`, `HARDCODED_DEFAULT_FALLBACK_RISK`, `CROSS_SERVICE_DRIFT`.

### 5. Finding
* **Definition**: An actionable, structured diagnostic emitted when a Rule condition fails or triggers an advisory warning during scanning.
* **Attributes**: `id`, `ruleId`, `severity` (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, `INFO`), `targetItem`, `message`, `explanation`, `remediation`, `codeSnippet`.

### 6. Knowledge Graph (Configuration Graph)
* **Definition**: A directed acyclic graph (DAG) representing the complete structural relationships between Configuration Items, source code call-sites, configuration schema definitions (`.env.example`, `schema.ts`), environment boundary declarations (`Dockerfile`, `docker-compose.yml`), and external service boundaries.
* **Nodes**: `ConfigurationItem`, `File`, `CallSite`, `Schema`, `ServiceBoundary`.
* **Edges**: `DECLARES`, `CONSUMES`, `VALIDATES_WITH`, `OVERRIDES`, `DEPENDS_ON`.

### 7. Health Score
* **Definition**: A calculated composite metric (0.0 to 100.0) quantifying the clarity, safety, documentation coverage, and structural hygiene of a repository's configuration ecosystem.
* **Calculation Factors**: Ratio of documented-to-undocumented variables, proportion of dead configuration, usage safety (fallback safety), and severity-weighted Rule Findings.

### 8. Framework Heuristic
* **Definition**: A pattern-matching rule set applied during the repository loading phase to detect active frameworks (e.g., Next.js, Vite, Django, Spring Boot, Express, NestJS) and extract their implicit configuration behaviors (such as variable prefixing rules like `NEXT_PUBLIC_` or `VITE_`).

### 9. Reporter
* **Definition**: The output transformation module in `packages/scanner/src/reporter` responsible for rendering the Knowledge Graph, Health Score, and Findings into human-readable or machine-parsable formats (Terminal ANSI, Markdown, JSON, HTML).

### 10. Deterministic Analysis
* **Definition**: Static code analysis that relies exclusively on AST parsing, formal grammar matching, and graph traversal. Guarantees 100% reproducible results for the same source tree without non-deterministic LLM hallucinations or external dynamic execution.
