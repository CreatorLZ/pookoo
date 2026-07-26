# Framework Detection Specification (`specs/framework-detection.md`)

## Purpose
To automatically infer the application framework of the repository based on file presence and dependencies, and inject framework-specific configuration rules (e.g., client-side prefix exposure).

## Responsibilities
1. Scan `package.json` for known dependencies (`next`, `vite`, `react-scripts`, `nuxt`, `svelte`).
2. Scan root directory for known configs (`next.config.js`, `vite.config.ts`, `nuxt.config.js`).
3. Return a `FrameworkHeuristic` object containing public prefixes and behavior rules.

## Inputs
- `VirtualFileTree`: The loaded repository files.

## Outputs
- `FrameworkContext` object. For example:
  ```ts
  {
    frameworkId: 'nextjs',
    publicPrefixes: ['NEXT_PUBLIC_'],
    implicitEnvFiles: ['.env', '.env.local', '.env.production']
  }
  ```

## Extension Points
- Future heuristic adapters for non-JS frameworks (Django, Spring Boot, Ruby on Rails) can be registered here.
