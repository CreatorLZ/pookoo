# Reporter Specification (`specs/reporter.md`)

## Purpose
To transform internal `ScanResult` JSON data into user-facing presentation formats.

## Responsibilities
1. Maintain generic Reporter interface `(result: ScanResult) => string`.
2. Provide `TerminalReporter` using ANSI color codes and table layouts.
3. Provide `MarkdownReporter` for static document generation.
4. Provide `JsonReporter` for raw JSON stringification.

## Constraints
- Reporters must never modify the graph or findings array.
- Avoid heavy runtime dependencies; prefer minimal ANSI libraries.
