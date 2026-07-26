# Usage Mapping Specification (`specs/usage-mapping.md`)

## Purpose
To locate every source code location where a configuration item is accessed.

## Responsibilities
1. Parse JS/TS files using a fast AST parser.
2. Traverse AST to locate specific accessor patterns (Direct Member, Destructured, Utility Wrappers).
3. Create `Usage` entities bridging code locations to `ConfigurationItem` keys.

## Inputs
- `VirtualFileTree` (filtered to source code files `.ts`, `.tsx`, `.js`, etc.).

## Outputs
- `Usage[]`

## Known Challenges
- Distinguishing between string literal dynamic access (`process.env['PORT']`) and computed dynamic access (`process.env[dynamicVar]`). Computed accesses must be flagged with a specific `DYNAMIC_COMPUTED` warning since they break static mapping.
