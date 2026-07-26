# @configiq/cli

> **The official command-line interface for ConfigIQ.**

## Installation

```bash
npm install -g @configiq/cli
# or
pnpm add -g @configiq/cli
```

## Usage

```bash
# Scan a repository
configiq scan /path/to/project

# Scan current directory with markdown output
configiq scan . --format markdown --output config-report.md

# Scan and fail CI build on HIGH or CRITICAL findings
configiq scan . --fail-on HIGH

# JSON output for programmatic consumption
configiq scan . --format json

# Run environment diagnostics
configiq doctor
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
