# ConfigIQ

> **The Intelligent Configuration Reasoning Engine.**  
> Point ConfigIQ at any codebase to instantly understand, audit, and reason about its configuration ecosystem.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue.svg)](https://www.typescriptlang.org/)
[![pnpm](https://img.shields.io/badge/pnpm-9.0-orange.svg)](https://pnpm.io/)
[![Turborepo](https://img.shields.io/badge/Turborepo-1.13-ef4444.svg)](https://turbo.build/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 💡 What is ConfigIQ?

Modern software configuration is fragmented across `.env` files, framework configurations (`next.config.js`, `vite.config.ts`), container manifests (`docker-compose.yml`, `Helm`), cloud templates, and scattered `process.env` calls deep inside application logic.

**ConfigIQ is NOT a secret manager.** It is not Doppler, Infisical, HashiCorp Vault, 1Password, or a `.env` editor. It does not manage, sync, or inject secret credentials.

**ConfigIQ is a configuration reasoning engine.** Its purpose is to help software engineers, security auditors, and AI agents **understand software configuration**.

ConfigIQ answers essential questions for any codebase:
- **Why does this variable exist?** Where was it declared and what introduced it?
- **Where is it consumed?** What exact call-sites and functions depend on it?
- **What breaks if I remove it?** Which services or features suffer regression?
- **Is it documented & typed?** Does it match expected schemas and fallback rules?
- **Is it dead configuration?** Is a declared environment variable completely unreferenced in source code?
- **Is it safe?** Are sensitive runtime options exposed through dynamic client-side prefixes (e.g., `NEXT_PUBLIC_` or `VITE_`)?

Refer to the complete [GLOSSARY.md](GLOSSARY.md) for canonical definitions of core domain concepts (*Configuration Item*, *Usage*, *Knowledge Graph*, *Rule*, *Finding*, *Health Score*).

---

## 🎯 Product Vision & Core Philosophy

Our north star is simple:

> **"Point this tool at any repository and receive an intelligent explanation of its configuration."**

### Core Principles
1. **Understanding over Feature Count**: We build features that deliver deep structural clarity, not administrative overhead.
2. **Static Analysis First**: Analysis must be 100% deterministic, fast, reproducible, and offline-capable using AST and graph analysis before applying AI context.
3. **Documentation is Production Code**: Architecture documents, specifications, and domain models are treated with the exact same rigor as runtime code.
4. **Library-First Architecture**: The core analysis engine lives inside `@configiq/scanner`. Clients (CLI, future VS Code extension, future GitHub Action) are thin presentation layers over the scanner library.
5. **Human and AI Agent Friendly**: Every specification, file boundary, and architectural document is written to allow autonomous AI agents and human engineers to collaborate seamlessly.

See our complete engineering ethos in [MANIFESTO.md](MANIFESTO.md) and long-term positioning in [VISION.md](VISION.md).

---

## 🏗️ Repository Structure & Layout

ConfigIQ is organized as a high-performance TypeScript monorepo managed with `pnpm` workspaces and `Turborepo`. We intentionally favor **modular internal directories over premature package proliferation**, maintaining only core execution boundaries as standalone packages.

```
configiq/
├── GLOSSARY.md               # Canonical domain lexicon & entity definitions
├── MANIFESTO.md              # Engineering principles & design philosophy
├── VISION.md                 # Product vision, market positioning, target audience
├── PRODUCT.md                # Feature scope, user journeys, competitive analysis
├── ARCHITECTURE.md           # Technical blueprint, AST parser pipeline, Knowledge Graph
├── ROADMAP.md                # Multi-phase milestone execution plan
├── AGENTS.md                 # Operating guidelines & constraints for AI agents
├── TASKS.md                  # Actionable engineering backlog
├── MILESTONES.md             # Project milestone state tracker
├── DECISIONS.md              # Architecture Decision Records (ADRs)
├── ANTI_GOALS.md             # Boundaries detailing what ConfigIQ intentionally refuses to be
├── CONTRIBUTING.md           # Development workflow, specifications, PR standards
├── LICENSE                   # MIT License
├── docs/                     # Detailed guides and usage manuals
├── specs/                    # Formal technical specifications per subsystem
│   ├── scanner.md
│   ├── framework-detection.md
│   ├── variable-discovery.md
│   ├── usage-mapping.md
│   ├── knowledge-graph.md
│   ├── rules-engine.md
│   ├── reporter.md
│   └── cli.md
├── apps/
│   └── cli/                  # Command-line interface client (@configiq/cli)
└── packages/
    ├── scanner/              # Core static analysis & reasoning engine (@configiq/scanner)
    │   └── src/
    │       ├── framework-detection/  # Heuristic framework detectors
    │       ├── variable-discovery/   # AST & manifest configuration discovery
    │       ├── usage-mapping/        # Source code call-site mapper
    │       ├── parser/               # Multi-format AST parsers (.env, TS, YAML, JSON)
    │       ├── rules/                # Deterministic linting & health rules
    │       ├── knowledge/            # Graph builder & DAG relationship engine
    │       └── reporter/             # Output formatters (ANSI, Markdown, JSON)
    └── shared/               # Shared primitive types, constants, schemas (@configiq/shared)
```

---

## 🚦 Current Status & Roadmap

ConfigIQ is currently at **Milestone 0 (Repository Foundation & Engineering Blueprint Established)**. The engineering operating system, specs, package manifests, and monorepo boundaries are fully scaffolded and ready for Milestone 1 implementation.

| Phase | Description | Status |
| :--- | :--- | :--- |
| **Phase 0** | Architecture, Engineering Operating System, Specifications | 🟩 Completed |
| **Phase 1** | Shared Primitive Types & AST Parser Engine | 🟦 Planned |
| **Phase 2** | Configuration Item Discovery & Framework Detectors | ⬜ Backlog |
| **Phase 3** | Call-Site Usage Mapping & Knowledge Graph DAG | ⬜ Backlog |
| **Phase 4** | Rules Engine & Health Score Evaluation | ⬜ Backlog |
| **Phase 5** | `@configiq/cli` Implementation & Terminal Reporter | ⬜ Backlog |

For detailed breakdown of phases, refer to [ROADMAP.md](ROADMAP.md) and [TASKS.md](TASKS.md).

---

## 🛠️ Development Setup

### Prerequisites
- **Node.js**: `>= 18.0.0`
- **pnpm**: `>= 8.0.0`

### Installation
```bash
# Clone the repository
git clone https://github.com/configiq/configiq.git
cd configiq

# Install dependencies
pnpm install
```

### Common Commands
```bash
# Build all packages via Turborepo
pnpm run build

# Run unit & integration tests
pnpm run test

# Perform static type checks
pnpm run typecheck

# Lint workspace files
pnpm run lint

# Format codebase
pnpm run format
```

---

## 📜 Architectural Decisions & Governance

All significant architectural choices are tracked via Architecture Decision Records in [DECISIONS.md](DECISIONS.md):
- **ADR-001**: pnpm Workspaces & Turborepo Monorepo Architecture
- **ADR-002**: Static Analysis First, AI Augmentation Second
- **ADR-003**: Pure Library Scanner Architecture with Single Package Internal Subsystems
- **ADR-004**: Graph-Based Knowledge Model for Configuration Entities

Before contributing or submitting pull requests, please read [CONTRIBUTING.md](CONTRIBUTING.md) and [AGENTS.md](AGENTS.md).
