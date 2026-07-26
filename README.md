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

Refer to the complete [GLOSSARY.md](GLOSSARY.md) locally for canonical definitions of core domain concepts (*Configuration Item*, *Usage*, *Knowledge Graph*, *Rule*, *Finding*, *Health Score*).

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

See `MANIFESTO.md`, `VISION.md`, and `ARCHITECTURE.md` locally for engineering philosophy, product vision, and technical blueprint.

---

## 🏗️ Repository Structure & Layout

ConfigIQ is organized as a high-performance TypeScript monorepo managed with `pnpm` workspaces and `Turborepo`. We intentionally favor **modular internal directories over premature package proliferation**, maintaining only core execution boundaries as standalone packages.

```
configiq/
├── CONTRIBUTING.md           # Development workflow & PR standards
├── LICENSE                   # MIT License
├── apps/
│   └── cli/                  # Command-line interface client (@configiq/cli)
│       └── README.md         # CLI usage documentation
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

## 🚦 Current Status

ConfigIQ is at **v0.1.0** — a fully functional CLI with multi-format parsing, variable discovery, knowledge graph, rules engine, and 3 output reporters. See the [CLI README](apps/cli/README.md) for usage.

---

## 🛠️ Development Setup

### Prerequisites
- **Node.js**: `>= 18.0.0`
- **pnpm**: `>= 8.0.0`

### Installation
```bash
# Clone the repository
git clone https://github.com/CreatorLZ/pookoo.git
cd pookoo

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

## 📜 Architectural Decisions

Key architectural choices (see `DECISIONS.md` locally for full ADRs):
- **Static Analysis First, AI Augmentation Second** — All parsing and rule checks are deterministic.
- **Library-First** — `@configiq/scanner` is the core; CLI is a thin wrapper.
- **Graph-Based Knowledge Model** — Configuration entities and their relationships are modeled as a DAG.

Before contributing, please read [CONTRIBUTING.md](CONTRIBUTING.md) and `AGENTS.md` (local).
