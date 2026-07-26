# Variable Discovery Specification (`specs/variable-discovery.md`)

## Purpose
To parse configuration declaration files and extract standard `ConfigurationItem` entities.

## Responsibilities
1. Parse `.env` family files using the custom Dotenv AST parser.
2. Extract default values, inline comments, and required statuses.
3. Parse `docker-compose.yml` for `environment` mappings.
4. Construct `ConfigurationItem` data models.

## Inputs
- `VirtualFileTree` (filtered to config/manifest files).

## Outputs
- `ConfigurationItem[]`

## Known Challenges
- Multi-line environment variables in `.env`.
- Inline comments sharing lines with variable declarations (e.g. `PORT=3000 # App Port`).
