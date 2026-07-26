# ConfigIQ Anti-Goals & Project Boundaries (`ANTI_GOALS.md`)

> **Explicit Boundaries: What ConfigIQ Intentionally Refuses To Become.**  
> *To maintain sharp product focus, high quality, and long-term clarity, ConfigIQ strictly enforces the following anti-goals.*

---

## ⛔ 1. NOT Another Secret Manager

* **We Will Never**: Store, encrypt, manage, or rotate production credentials or secret keys.
* **Why**: Secret management is a solved problem handled by Doppler, Infisical, HashiCorp Vault, AWS Secrets Manager, and 1Password. Adding secret vaulting bloats our architecture, introduces severe compliance/security risks, and distracts from our mission.
* **ConfigIQ Focus**: We **understand** secrets and configuration usage in source code; we do not store them.

---

## 2. NOT Another `.env` File Editor or GUI Manager

* **We Will Never**: Build a graphical desktop app or web portal for editing `.env` key-value pairs or syncing `.env` files between developers over HTTP.
* **Why**: Dotenv sync tools (`dotenvx`, `direnv`, `Envii`) already provide `.env` editing and file encryption. ConfigIQ is an engineering intelligence tool, not a text editor wrapper.

---

## ⛔ 3. NOT Another SaaS Platform or Cloud Vault

* **We Will Never**: Require a mandatory cloud account, subscription SaaS backend, user authentication, or database connection to perform configuration analysis.
* **Why**: ConfigIQ must execute 100% offline, locally, and deterministically within developer terminals and CI/CD runners. Your code and configuration structure never leave your machine.

---

## ⛔ 4. NOT Another Runtime Secret Injection Proxy

* **We Will Never**: Intercept process startup signals or inject dynamic credentials into running production containers at dynamic execution time.
* **Why**: Runtime injection introduces hidden production failure points and breaks local determinism. ConfigIQ performs static analysis before deployment.

---

## ⛔ 5. NOT Another Generic Linter

* **We Will Never**: Build rules for general JavaScript style, code formatting, indentation, or non-configuration AST patterns.
* **Why**: ESLint, Prettier, and Biome excel at code linting. ConfigIQ focuses exclusively on the configuration domain (*Configuration Items*, *Usages*, *Knowledge Graphs*, *Health Scores*).

---

## Summary Covenant

| Feature Request | Allowed in ConfigIQ? | Alternative Tool |
| :--- | :--- | :--- |
| Store production passwords in encrypted cloud | ❌ NO | Vault, Doppler, Infisical |
| Edit `.env` values in a web portal | ❌ NO | dotenvx, IDE text editor |
| Static analysis of `.env` vs `process.env` usages | ✅ **YES** | **ConfigIQ** |
| Detect dead configuration keys in monorepos | ✅ **YES** | **ConfigIQ** |
| Flag client-side leak of secret prefixes | ✅ **YES** | **ConfigIQ** |
