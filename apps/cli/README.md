# pookoo

**Find broken, unused, and leaked environment variables before they break production.**

Pookoo scans your JS/TS project and tells you which env vars are dead, which are missing from `.env.example`, and which secrets you're accidentally shipping to the browser. It scans your source code via AST parsing, it never runs your app, never sends data anywhere, and always produces the same output for the same input. It can also generate a `.env.example` file from your source code and a `CONFIG_DOCS.md` file with a table of all environment variables in your project.

```bash
npx pookoo scan .
```

---

## The problem

Your `.env` has 30 variables but half of them are left over from features you deleted last year. Your `.env.example` is out of date. Someone put a Stripe secret key behind `NEXT_PUBLIC_` and nobody noticed. Pookoo catches all of this in under a second.

Supports **Next.js**, **Vite**, **Create React App**, **Node.js**, and plain TypeScript.

---

## Installation

```bash
# Install globally (recommended for daily use)
npm install -g pookoo

# Or run without installing
npx pookoo scan .
```

---

## Commands

### `pookoo scan` — Audit your configuration

Scans your repository and reports configuration issues categorized by severity.

```bash
pookoo scan .                              # Terminal report
pookoo scan . --format markdown -o report.md  # Save as markdown
pookoo scan . --format json                # JSON output (for scripts/CI)
pookoo scan . --fail-on HIGH               # Exit 1 in CI if HIGH issues found
```

| Option                 | Description                                     | Default    |
| :--------------------- | :---------------------------------------------- | :--------- |
| `-f, --format <type>`  | Output format: `terminal`, `markdown`, `json`   | `terminal` |
| `-o, --output <file>`  | Write report to file instead of stdout          | stdout     |
| `--fail-on <severity>` | Exit 1 if findings meet or exceed this severity | off        |

> When `-o` is used without `--format`, format defaults to `markdown`. INFO findings are never counted by `--fail-on`.

**What it detects:**

- Variables declared in `.env` but never referenced in source code
- Variables used in source code but absent from `.env.example`
- Secrets exposed through client-side prefixes (`NEXT_PUBLIC_`, `VITE_`, `REACT_APP_`)
- The same variable using different hardcoded fallback values across files

---

### `pookoo init` — Generate `.env.example`

Analyzes your source code and generates a complete `.env.example` file from what your project actually uses.

```bash
pookoo init .                    # Generate .env.example
pookoo init . --examples         # Include placeholder example values
pookoo init . --force            # Overwrite if file already exists
pookoo init . -o path/to/.env.example  # Custom output path
```

| Option                | Description                        | Default                     |
| :-------------------- | :--------------------------------- | :-------------------------- |
| `-o, --output <file>` | Output path                        | `<targetPath>/.env.example` |
| `--force`             | Overwrite existing file            | off                         |
| `--examples`          | Include placeholder example values | off                         |
| `--no-comments`       | Omit descriptive comments          | comments included           |
| `--no-sources`        | Omit source file usage hints       | sources included            |
| `--no-groups`         | Don't group variables by category  | grouped                     |

---

### `pookoo docs` — Generate configuration reference

Generates a `CONFIG_DOCS.md` with a table of every environment variable your project uses, where it's referenced, and whether it's required.

```bash
pookoo docs .                            # Generate CONFIG_DOCS.md
pookoo docs . --title "My App Config"    # Custom document title
pookoo docs . -o docs/env-reference.md  # Custom output path
```

| Option                | Description             | Default                       |
| :-------------------- | :---------------------- | :---------------------------- |
| `-o, --output <file>` | Output path             | `<targetPath>/CONFIG_DOCS.md` |
| `--force`             | Overwrite existing file | off                           |
| `--title <title>`     | Document title          | `Configuration Reference`     |
| `--no-summary`        | Omit overview summary   | summary included              |

---

### `pookoo doctor` — Sanity check

Makes sure Node.js and your project structure look right before scanning.

```bash
pookoo doctor
```

---

## Exit Codes

| Code | Meaning                                                                         |
| :--- | :------------------------------------------------------------------------------ |
| `0`  | Success — no issues above the `--fail-on` threshold                             |
| `1`  | Issues found above threshold, file conflict without `--force`, or runtime error |

---

## Links

- **npm:** [npmjs.com/package/pookoo](https://www.npmjs.com/package/pookoo)
- **GitHub:** [github.com/CreatorLZ/pookoo](https://github.com/CreatorLZ/pookoo)
- **Scanner API:** [@pookoo/scanner](https://www.npmjs.com/package/@pookoo/scanner)
