# Scanner Pipeline Specification (`specs/scanner.md`)

## Purpose
The Scanner Pipeline is the root orchestrator of `@configiq/scanner`. It coordinates the flow of data from raw file reading to the final `ScanResult`.

## Responsibilities
1. Accept configuration parameters (target directory, exclude paths).
2. Invoke the `loader` to retrieve the virtual file tree.
3. Pass the file tree to `variable-discovery` to find Configuration Items.
4. Pass the file tree to `usage-mapping` to find call-sites.
5. Invoke `framework-detection` to apply heuristic metadata.
6. Trigger the `knowledge-graph` builder.
7. Execute the `rules-engine` over the graph.
8. Return a cohesive `ScanResult`.

## Inputs
- `targetPath` (string): Absolute path to the repository root.
- `options` (object): Options such as `ignorePatterns`, `failOnSeverity`.

## Outputs
- `ScanResult` object containing:
  - `knowledgeGraph` (DAG instance)
  - `findings` (Array of Finding objects)
  - `healthScore` (number 0-100)

## Constraints
- Must remain 100% synchronous or predictable async without external network calls.
- Must not throw unhandled exceptions on malformed files (should return Parsing Error Findings instead).
