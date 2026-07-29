# Pookoo

Point Pookoo at any codebase to understand, document, and audit its configuration.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue.svg)](https://www.typescriptlang.org/)
[![pnpm](https://img.shields.io/badge/pnpm-9.0-orange.svg)](https://pnpm.io/)
[![Turborepo](https://img.shields.io/badge/Turborepo-1.13-ef4444.svg)](https://turbo.build/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## What is Pookoo?

Configuration is scattered across `.env` files, framework configs, container manifests, and `process.env` calls buried in code. Pookoo uses static AST analysis to find, document, and audit all of it.

Pookoo is not a secret manager. It does not store, sync, or inject credentials.

```bash
# Generate .env.example from your codebase
pookoo init ./my-project

# Generate configuration reference docs
pookoo docs ./my-project

# Audit configuration for issues
pookoo scan ./my-project
```

**`pookoo init`** scans your code and generates a `.env.example` with every discovered variable, grouped by category, with descriptions and source file hints. Values are blank by default -- real secrets are never exported. Use `--examples` for placeholder values.

**`pookoo docs`** generates a markdown config reference -- categorized tables showing each variable, its scope (Client/Server), and where it's used. Output is deterministic (no timestamps).

**`pookoo scan`** finds variables with no static source references, inconsistent fallback defaults, and secrets exposed through client-side prefixes (while correctly ignoring publishable keys).

Pookoo answers these questions for any codebase:
- What variables does this project need?
- Where is each variable consumed?
- What breaks if I remove it?
- Is a declared variable actually referenced in source files?
- Are secrets exposed through client-side prefixes?

See [GLOSSARY.md](GLOSSARY.md) for domain terminology.

## Repository Structure

```
pookoo/
├── apps/cli/                  # Command-line interface
│   └── README.md              # CLI usage docs
├── packages/
│   ├── scanner/src/           # Core analysis engine
│   │   ├── framework-detection/
│   │   ├── variable-discovery/
│   │   ├── usage-mapping/
│   │   ├── parser/            # .env, TS, YAML, JSON parsers
│   │   ├── rules/             # Rule engine
│   │   ├── knowledge/         # Knowledge graph builder
│   │   ├── env-generator/     # .env.example generator
│   │   ├── docs-generator/    # Config docs generator
│   │   └── reporter/          # Terminal, Markdown, JSON output
│   └── shared/                # Shared types
├── CONTRIBUTING.md
└── LICENSE
```

## Current Status

Pookoo is at **v0.1.0** -- a working CLI with multi-format parsing, variable discovery, knowledge graph, rules engine, `.env.example` generation, config documentation generation, and 3 output reporters. Both `init` and `docs` require `--force` to overwrite existing files. See the [CLI README](apps/cli/README.md) for usage.

## Development Setup

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
pnpm run build     # Build all packages
pnpm run test      # Run tests
pnpm run lint      # Lint workspace
pnpm run format    # Format code
```

## Architectural Decisions

Key choices:
- **Static analysis first** -- All parsing and rule checks are deterministic. No AI/LLM.
- **Library-first** -- `@pookoo/scanner` is the core; CLI is a thin wrapper.
- **Graph-based knowledge model** -- Configuration entities and their relationships are modeled as a DAG.

Before contributing, read [CONTRIBUTING.md](CONTRIBUTING.md) and `AGENTS.md`.
