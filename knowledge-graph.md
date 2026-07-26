# Knowledge Graph Specification (`specs/knowledge-graph.md`)

## Purpose
To connect isolated entities (`ConfigurationItem`, `Usage`, `File`) into a traverseable Directed Acyclic Graph.

## Responsibilities
1. Accept `ConfigurationItem[]` and `Usage[]`.
2. Build graph nodes with proper IDs.
3. Establish directed edges (`DECLARES`, `READS_FROM`, `VALIDATES`).
4. Provide graph traversal APIs (e.g. `getConsumers(itemId)`, `getDeclarations(usageId)`).

## Data Model
- Nodes are stored in a fast adjacency list or Map structure.
- The Graph must be serializable to JSON for client transmission.
