# The ConfigIQ Engineering Manifesto

> **"We build for understanding, not management. We measure success by how quickly an engineer can reason about a system's configuration."**

---

## 1. Developer Understanding Over Feature Count

Software configuration is broken—not because we lack tools to store keys, but because we lack tools to **understand** them. Secret managers and vault services store key-value pairs; they do not explain *why* a variable exists, *where* it is consumed, or *what breaks* when it changes.

ConfigIQ exists to solve understanding. We intentionally refuse to build administrative bloat, SaaS dashboards for syncing `.env` files, or complex credential access management systems. Every feature added to ConfigIQ must directly increase developer comprehension of codebase configuration.

---

## 2. Every Feature Must Answer a Real Developer Question

We do not build speculative abstractions or vanity metrics. Every feature, rule, output panel, and CLI command must answer a concrete question asked by an engineer facing a production codebase:
* *"Where is `PORT` being read in the backend?"*
* *"Is `NEXT_PUBLIC_STRIPE_KEY` accidentally leaking secret keys?"*
* *"Can I safely delete `FEATURE_FLAG_ALPHA` without breaking dynamic routes?"*
* *"Why does this service crash on startup in staging despite having a valid `.env`?"*

If a proposed capability does not answer a real developer question, it does not belong in ConfigIQ.

---

## 3. Static Analysis Before AI

Deterministic static analysis is the bedrock of ConfigIQ. AST parsing, formal grammar extraction, schema validation, and graph traversal provide 100% reproducible, sub-second analysis that works completely offline, with zero network overhead, zero hallucinations, and zero token costs.

AI capabilities within ConfigIQ exist strictly to **augment reasoning**—synthesizing natural language explanations from deterministic facts extracted by our AST parser and Knowledge Graph. AI **never** replaces deterministic analysis. An AI model will never guess whether an environment variable is present in code; our AST parser will *prove* it.

---

## 4. Documentation is Production Code

Specifications, Architecture Decision Records (ADRs), domain glossaries, and README files are held to the exact same quality standard as production TypeScript code. Undocumented code is incomplete code; ambiguous specifications are broken specs.

Documentation must be:
- **Executable in intent**: Written with exact entity names and schema signatures matching [GLOSSARY.md](GLOSSARY.md).
- **AI-Agent and Human Native**: Clear enough that an autonomous AI agent or a new human maintainer can understand the architecture in under five minutes.
- **Maintained continuously**: Updated in the exact same pull request as any architectural modification.

---

## 5. Simple Beats Clever, Reusable Beats Coupled

Complex code is technical debt disguised as sophistication. We favor explicit, readable TypeScript over hyper-abstracted metaprogramming. 

- **Internal Folders over premature Package Explosion**: We organize subsystems cleanly inside `packages/scanner/src/` (`framework-detection`, `variable-discovery`, `usage-mapping`, `rules`, `knowledge`, `reporter`) until clean, stable, external reuse boundaries strictly necessitate separate packages.
- **Composition over Inheritance**: Analysis rules, parsers, and reporters are composable functions with pure inputs and outputs.
- **Zero Side-Effects**: The scanner engine is completely stateless and side-effect free. It reads filesystems and returns structured Knowledge Graphs without mutating user files or global environment states.

---

## 6. The Scanner is the Heart; Everything Else is a Client

The core domain of ConfigIQ resides entirely within `@configiq/scanner`. 

The CLI (`apps/cli`), future VS Code extensions, future GitHub Actions, and future web visualizations are strictly presentation layer clients. They consume the Knowledge Graph and Findings produced by `@configiq/scanner`. No core parsing, framework detection, or rule logic will ever leak into client packages.

---

## 7. We Build for the Long Term

ConfigIQ is built to endure. We prioritize long-term maintainability over quick hacks:
- Strict TypeScript type safety across all interfaces.
- Zero unneeded external dependencies.
- 100% specification-driven development.
- Architectural decision history preserved permanently in `DECISIONS.md`.

*This manifesto is our binding covenant. Any pull request or design proposal that violates these principles shall be rejected.*
