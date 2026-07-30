# @pookoo/cli

Command-line interface for Pookoo.

## Installation

```bash
npm install -g @pookoo/cli
pnpm add -g @pookoo/cli
```

### Local Development

```bash
cd apps/cli
npm link
```

The `pookoo` command will be available system-wide, pointing at your local build.

## Usage

```bash
pookoo scan /path/to/project
pookoo init /path/to/project
pookoo docs /path/to/project
pookoo doctor
```

## Exit Codes

| Code | Meaning                                                                                 |
| :--- | :-------------------------------------------------------------------------------------- |
| `0`  | Success (or no findings above `--fail-on` threshold)                                    |
| `1`  | Findings exceeded `--fail-on`, file would be overwritten without `--force`, or an error |

## Commands

### `scan [targetPath]`

Scan a repository to audit its configuration.

| Option                 | Description                                           | Default    |
| :--------------------- | :---------------------------------------------------- | :--------- |
| `-f, --format <type>`  | Output format: `terminal`, `markdown`, `json`         | `terminal` |
| `-o, --output <file>`  | Write report to file instead of stdout                | stdout     |
| `--fail-on <severity>` | Exit 1 if non-INFO findings meet/exceed this severity | off        |

When `-o` is used without `--format`, format defaults to `markdown`. INFO findings are excluded from `--fail-on`.

### `init [targetPath]`

Generate `.env.example` from discovered configuration variables.

| Option                | Description                                   | Default                     |
| :-------------------- | :-------------------------------------------- | :-------------------------- |
| `-o, --output <file>` | Output path (relative to target, or absolute) | `<targetPath>/.env.example` |
| `--force`             | Overwrite existing file                       | off                         |
| `--examples`          | Include placeholder example values            | off                         |
| `--no-comments`       | Omit descriptive comments                     | comments included           |
| `--no-sources`        | Omit source file usage hints                  | sources included            |
| `--no-groups`         | Don't group by category                       | grouped                     |

### `docs [targetPath]`

Generate markdown configuration reference documentation.

| Option                | Description                                   | Default                       |
| :-------------------- | :-------------------------------------------- | :---------------------------- |
| `-o, --output <file>` | Output path (relative to target, or absolute) | `<targetPath>/CONFIG_DOCS.md` |
| `--force`             | Overwrite existing file                       | off                           |
| `--title <title>`     | Document title                                | `Configuration Reference`     |
| `--no-summary`        | Omit overview summary                         | summary included              |

### `doctor`

Run self-diagnostic checks (Node.js version, project structure).
