# @configiq/scanner

> **The core configuration reasoning engine for ConfigIQ.**

This package is the heart of the project. It implements the deterministic static analysis pipeline.

## Responsibilities
- AST Parsing (`src/parser`)
- Framework Heuristic Detection (`src/framework-detection`)
- Variable Discovery (`src/variable-discovery`)
- Call-Site Usage Mapping (`src/usage-mapping`)
- Knowledge Graph Construction (`src/knowledge`)
- Rules Evaluation & Scoring (`src/rules`)
- Output Formatting (`src/reporter`)

## Non-goals
- Do not implement CLI arguments or process exit logic here.
- Do not make HTTP requests or telemetry calls.
- The scanner must remain 100% pure, deterministic, and side-effect free.
