# CLI Specification (`specs/cli.md`)

## Purpose
The `@configiq/cli` package is the user-facing command-line entry point to the scanner.

## Responsibilities
1. Setup process handling and Node.js environment boundaries.
2. Initialize command parsers using `commander`.
3. Handle file paths, current working directory (`cwd`), and glob exclusions.
4. Pass parsed options to `@configiq/scanner` and wait for `ScanResult`.
5. Direct output to `stdout` / `stderr`.

## Subcommands
- `configiq scan [path]` (Default action)
- `configiq graph [path]` (Export graph JSON)
- `configiq doctor` (Self-health check)

## Flags
- `--format <terminal|markdown|json>`
- `--fail-on <severity>` (Exit with 1 if findings exceed severity threshold)
- `--ignore <patterns>`
