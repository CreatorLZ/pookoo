# Pookoo

**Find broken, unused, and leaked environment variables before they break production.**

```bash
npx pookoo scan .
```

## What does it do?

Your `.env` has variables left over from features you deleted. Your `.env.example` is out of date. Someone put a Stripe secret behind `NEXT_PUBLIC_` and nobody noticed.

Pookoo reads your source code via AST parsing and catches all of this. It never runs your app and never sends data anywhere.

**`pookoo scan`** finds variables with no static source references, inconsistent fallback defaults, and secrets exposed through client-side prefixes (while correctly ignoring publishable keys).

**`pookoo init`** scans your code and generates a `.env.example` with every discovered variable, grouped by category, with descriptions and source file hints.

**`pookoo docs`** generates a markdown config reference with categorized tables showing each variable, its scope (Client/Server), and where it's used.

```bash
pookoo init ./my-project    # Generate .env.example from your codebase
pookoo docs ./my-project    # Generate configuration reference docs
pookoo scan ./my-project    # Audit configuration for issues
pookoo doctor               # Sanity check
```

Supports **Next.js**, **Vite**, **Create React App**, **Node.js**, and plain TypeScript.

Pookoo is not a secret manager. It does not store, sync, or inject credentials.

## Install

```bash
npm install -g pookoo
```

See the [CLI README](apps/cli/README.md) for full command reference and flags.

## Repository Structure

```
pookoo/
├── apps/cli/                  # Command-line interface
│   └── README.md              # CLI usage and flags
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

## Development Setup

### Prerequisites

- **Node.js**: `>= 18.0.0`
- **pnpm**: `>= 8.0.0`

### Getting started

```bash
git clone https://github.com/CreatorLZ/pookoo.git
cd pookoo
pnpm install
pnpm run build
```

### Common commands

```bash
pnpm run build     # Build all packages
pnpm run test      # Run tests (73 tests across scanner + CLI)
pnpm run lint      # Lint workspace
```

## Design decisions

- **Static analysis only** — All parsing and rule checks are deterministic. No AI, no heuristics.
- **Library-first** — `@pookoo/scanner` is the core engine. The CLI is a thin wrapper around it.
- **Graph-based model** — Configuration entities and their relationships are modeled as a directed graph.

Before contributing, read [CONTRIBUTING.md](CONTRIBUTING.md).
