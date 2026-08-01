# Contributing to Pookoo (`CONTRIBUTING.md`)

> **Contributor Guidelines for Human Engineers and AI Coding Agents.**

Thank you for contributing to **Pookoo**! We maintain an extremely high engineering standard to ensure long-term maintainability, zero security leaks, and exceptional developer experience.

---

## 1. Development Philosophy

1. **Documentation & Specification First**: No feature code is written without an updated entry in [TASKS.md](TASKS.md) and a corresponding ADR in [DECISIONS.md](DECISIONS.md) if the change is architectural.
2. **Folders Over Packages**: Maintain all scanner submodules (`framework-detection`, `variable-discovery`, `usage-mapping`, `parser`, `rules`, `knowledge`, `reporter`) inside `packages/scanner/src/`. Do not create new packages in `packages/` without an approved ADR in [DECISIONS.md](DECISIONS.md).
3. **Deterministic & Pure**: Code in `@pookoo/scanner` must be stateless, side-effect free, and 100% testable offline via Vitest.
4. **Strict TypeScript**: No `any` types. Full type signatures required for all exports.

---

## 2. Getting Started

### Local Setup

```bash
# 1.
cd pookoo

# 2. Install dependencies via pnpm
pnpm install

# 3. Build workspace
pnpm run build

# 4. Run tests
pnpm run test
```

---

## 3. Pull Request Guidelines

- **Granular PRs**: Keep pull requests focused on a single task from [TASKS.md](TASKS.md).
- **Conventional Commits**: Format commit messages according to Conventional Commits:
  - `feat(scanner): add dotenv AST comment extractor`
  - `fix(parser): resolve multi-line quote stripping bug`
  - `docs(specs): update usage mapping AST specification`
- **Testing**: Every code change must include corresponding Vitest unit tests in `packages/scanner/src/**/__tests__/`.
- **Validation**: Ensure `pnpm run build`, `pnpm run typecheck`, `pnpm run lint`, and `pnpm run test` pass cleanly before submitting your PR.

---

## 4. Documentation & Domain Lexicon Rules

All pull requests modifying docs or code must strictly use canonical domain terms defined in [GLOSSARY.md](GLOSSARY.md):

- _Configuration Item_ (not "env var object" or "config key string")
- _Usage_ (not "code reference location")
- _Knowledge Graph_ (not "dependency map")
- _Rule_ & _Finding_ (not "lint alert" or "warning error")
- _Health Score_ (not "repo score")

For AI Agent specific operating protocols, see [AGENTS.md](AGENTS.md).
