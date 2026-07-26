# ConfigIQ Engineering Task Backlog (`TASKS.md`)

> **Actionable, single-session engineering task tracking.**

---

## 🟢 Completed

### Milestone 0: Repository Foundation & Engineering Blueprint
- [x] **TASK-000**: Bootstrap monorepo foundation
- [x] **TASK-001**: Establish core engineering operating system docs
- [x] **TASK-002**: Scaffold technical subsystem specifications under `/specs/`
- [x] **TASK-003**: Scaffold package layout

### Milestone 1: Core Primitives & AST Parser Engine
- [x] **TASK-010**: Implement `@configiq/shared` domain interfaces
- [x] **TASK-011**: Build custom Dotenv AST parser module
- [x] **TASK-012**: Write Vitest unit test suite for Dotenv AST parser
- [x] **TASK-013**: Implement TypeScript/JavaScript source code AST parser wrapper
- [x] **TASK-014**: Write Vitest unit tests for TypeScript call-site AST extraction
- [x] **TASK-015**: Implement YAML environment parser module with test suite

### Milestone 2: Configuration Discovery & Framework Detectors
- [x] **TASK-020**: Implement file walker pipeline with `.gitignore` filtering
- [x] **TASK-021**: Implement Next.js framework detector
- [x] **TASK-022**: Implement Vite framework detector with test suite
- [x] **TASK-023**: Build `VariableDiscoveryEngine` with test suite

### Milestone 3: Usage Mapping & Knowledge Graph
- [x] **TASK-030**: Build `UsageMappingEngine` with test suite
- [x] **TASK-031**: Build `KnowledgeGraphBuilder` with test suite

### Milestone 4: Rules Engine & Health Scoring
- [x] **TASK-040**: Implement `NO_UNREFERENCED_ENV_VAR` rule
- [x] **TASK-041**: Implement `UNDOCUMENTED_REQUIRED_VAR` rule
- [x] **TASK-042**: Implement `PUBLIC_PREFIX_SECRET_RISK` rule
- [x] **TASK-043**: Implement composite Health Score calculator & `evaluateRules` engine

### Milestone 5: `@configiq/cli` & Reporters
- [x] **TASK-050**: Implement ANSI terminal reporter
- [x] **TASK-051**: Implement Markdown report generator
- [x] **TASK-052**: Build main `scan` function orchestrator with end-to-end test
- [x] **TASK-053**: Implement `@configiq/cli` binary CLI application

### Production Hardening (Phase P0-P4)
- [x] **TASK-P01**: Implement `FALLBACK_INCONSISTENCY` rule
- [x] **TASK-P02**: Fix column range hardcode in TypeScript parser
- [x] **TASK-P03**: Fix CONSUMES edge for DYNAMIC_COMPUTED usages
- [x] **TASK-P04**: Fix `--fail-on` severity cascade in CLI
- [x] **TASK-P05**: Expand unreferenced allowlist (NODE_ENV, Node.js built-ins)
- [x] **TASK-P06**: Preserve multi-file DECLARES edges in knowledge graph
- [x] **TASK-P07**: Replace line-scanner YAML parser with `js-yaml`
- [x] **TASK-P08**: Add proper JSON parser module
- [x] **TASK-P09**: Add `.env.example` schema inference
- [x] **TASK-P10**: Add file size limit to walker
- [x] **TASK-P11**: Add ANSI color to terminal reporter
- [x] **TASK-P12**: Add progress/profiling to scan pipeline
- [x] **TASK-P13**: Add `configiq doctor` command
- [x] **TASK-P14**: Add `--output <file>` flag to CLI
- [x] **TASK-P15**: Add `.configiqrc` config file support
- [x] **TASK-P16**: Extract JSON reporter to proper module
- [x] **TASK-P17**: Fix lint scripts across all packages
- [x] **TASK-P18**: Write reporter tests (terminal, markdown, json)
- [x] **TASK-P19**: Write CLI tests
- [x] **TASK-P20**: Add coverage configuration
- [x] **TASK-P21**: Add `.npmrc` for pnpm monorepo settings
- [x] **TASK-P22**: Add fixture test infrastructure
- [x] **TASK-P23**: Add GitHub Actions CI workflow
- [x] **TASK-P24**: Add npm packaging setup
- [x] **TASK-P25**: Write CLI README with examples
- [x] **TASK-P26**: Create `.env.example` for ConfigIQ itself
- [x] **TASK-P27**: Fix `@types/node` version compatibility
- [x] **TASK-P28**: Bump version to `0.1.0`
- [x] **TASK-P29**: Fix ESM warning with `"type": "module"` in root package.json
- [x] **TASK-P30**: Remove incompatible `@types/js-yaml`, install coverage-v8
- [x] **TASK-P31**: Enable `all: true` in coverage config, update MILESTONES.md
- [x] **TASK-P32**: Final audit — clean build + full test suite (43 tests, 15 test files, all pass)

---

## 🟡 In Progress

- *None currently in progress.*

---

## 🔵 Next Up (Milestone 6: AI-Augmented Reasoning Synthesis)

- [ ] **TASK-060**: Design Graph-to-Prompt serializer for passing AST Knowledge Graph facts to LLM providers (`packages/scanner/src/ai/serializer.ts`).
- [ ] **TASK-061**: Implement natural language query reasoning interface (`packages/scanner/src/ai/reasoner.ts`).

---

## ⚪ Backlog

### Milestone 7: Ecosystem Integrations (IDE & CI/CD)
- [ ] **TASK-070**: VS Code extension wrapper.
- [ ] **TASK-071**: GitHub Action status check runner.

---

## 🚫 Blocked

- *No blocked tasks.*
