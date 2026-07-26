# Pookoo

> **The Intelligent Configuration Reasoning Engine.**  
> Point Pookoo at any codebase to instantly understand, audit, and reason about its configuration ecosystem.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue.svg)](https://www.typescriptlang.org/)
[![pnpm](https://img.shields.io/badge/pnpm-9.0-orange.svg)](https://pnpm.io/)
[![Turborepo](https://img.shields.io/badge/Turborepo-1.13-ef4444.svg)](https://turbo.build/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 💡 What is Pookoo?

Modern software configuration is fragmented across `.env` files, framework configurations (`next.config.js`, `vite.config.ts`), container manifests (`docker-compose.yml`, `Helm`), cloud templates, and scattered `process.env` calls deep inside application logic.

**Pookoo is NOT a secret manager.** It is not Doppler, Infisical, HashiCorp Vault, 1Password, or a `.env` editor. It does not manage, sync, or inject secret credentials.

**Pookoo is a configuration reasoning engine.** Its purpose is to help software engineers, security auditors, and AI agents **understand software configuration**.

Pookoo answers essential questions for any codebase:
- **Why does this variable exist?** Where was it declared and what introduced it?
- **Where is it consumed?** What exact call-sites and functions depend on it?
- **What breaks if I remove it?** Which services or features suffer regression?
- **Is it documented & typed?** Does it match expected schemas and fallback rules?
- **Is it dead configuration?** Is a declared environment variable completely unreferenced in source code?
- **Is it safe?** Are sensitive runtime options exposed through dynamic client-side prefixes (e.g., `NEXT_PUBLIC_` or `VITE_`)?

Refer to the complete [GLOSSARY.md](GLOSSARY.md) locally for canonical definitions of core domain concepts (*Configuration Item*, *Usage*, *Knowledge Graph*, *Rule*, *Finding*, *Health Score*).

---

## 🏗️ Repository Structure

```
pookoo/
├── CONTRIBUTING.md           # Development workflow & PR standards
├── LICENSE                   # MIT License
├── apps/
│   └── cli/                  # Command-line interface client (@pookoo/cli)
│       └── README.md         # CLI usage documentation
└── packages/
    ├── scanner/              # Core static analysis & reasoning engine (@pookoo/scanner)
    │   └── src/
    │       ├── framework-detection/  # Heuristic framework detectors
    │       ├── variable-discovery/   # AST & manifest configuration discovery
    │       ├── usage-mapping/        # Source code call-site mapper
    │       ├── parser/               # Multi-format AST parsers (.env, TS, YAML, JSON)
    │       ├── rules/                # Deterministic linting & health rules
    │       ├── knowledge/            # Graph builder & DAG relationship engine
    │       └── reporter/             # Output formatters (ANSI, Markdown, JSON)
    └── shared/               # Shared primitive types, constants, schemas (@pookoo/shared)
```

---

## 🚦 Current Status

Pookoo is at **v0.1.0** — a fully functional CLI with multi-format parsing, variable discovery, knowledge graph, rules engine, and 3 output reporters. See the [CLI README](apps/cli/README.md) for usage.

---

## 🛠️ Development Setup

### Prerequisites
- **Node.js**: `>= 18.0.0`
- **pnpm**: `>= 8.0.0`

### Installation
```bash
git clone https://github.com/CreatorLZ/pookoo.git
cd pookoo
pnpm install
```

### Common Commands
```bash
pnpm run build     # Build all packages via Turborepo
pnpm run test      # Run unit & integration tests
pnpm run lint      # Lint workspace files
pnpm run format    # Format codebase
```

---

## 📜 Architectural Decisions

Key architectural choices (see `DECISIONS.md` locally for full ADRs):
- **Static Analysis First, AI Augmentation Second** — All parsing and rule checks are deterministic.
- **Library-First** — `@pookoo/scanner` is the core; CLI is a thin wrapper.
- **Graph-Based Knowledge Model** — Configuration entities and their relationships are modeled as a DAG.

Before contributing, please read [CONTRIBUTING.md](CONTRIBUTING.md) and `AGENTS.md` (local).
