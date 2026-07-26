# @pookoo/cli

> **The official command-line interface for Pookoo.**

## Installation

```bash
npm install -g @pookoo/cli
# or
pnpm add -g @pookoo/cli
```

## Usage

```bash
# Scan a repository
pookoo scan /path/to/project

# Scan current directory with markdown output
pookoo scan . --format markdown --output config-report.md

# Scan and fail CI build on HIGH or CRITICAL findings
pookoo scan . --fail-on HIGH

# JSON output for programmatic consumption
pookoo scan . --format json

# Run environment diagnostics
pookoo doctor
```

## Exit Codes

| Code | Meaning |
| :--- | :------ |
| `0`  | Scan completed cleanly (or no findings above `--fail-on` threshold) |
| `1`  | Findings exceeded `--fail-on` threshold, or an error occurred |

## Commands

### `scan [targetPath]`

Scans a repository to discover, audit, and reason about its configuration ecosystem.

| Option | Description | Default |
| :----- | :---------- | :------ |
| `-f, --format <type>` | Output format: `terminal`, `markdown`, `json` | `terminal` |
| `-o, --output <file>` | Write report to file instead of stdout | stdout |
| `--fail-on <severity>` | Exit code 1 if findings equal or exceed this severity | off |

### `doctor`

Runs self-diagnostic checks on the current environment (Node.js version, project structure).
