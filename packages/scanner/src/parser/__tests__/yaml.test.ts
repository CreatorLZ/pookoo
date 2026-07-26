import { describe, it, expect } from "vitest";
import { parseYamlEnvironment } from "../yaml";

describe("parseYamlEnvironment", () => {
  it("parses list-style docker-compose environment variables", () => {
    const yaml = `
version: '3.8'
services:
  web:
    image: node:18
    environment:
      - PORT=8080
      - DATABASE_URL=postgres://db:5432/main
      - SECRET_KEY
    `;
    const result = parseYamlEnvironment(yaml, { filePath: "docker-compose.yml" });

    expect(result).toHaveLength(3);
    expect(result[0]).toMatchObject({ key: "PORT", defaultValue: "8080", isRequired: false });
    expect(result[1]).toMatchObject({ key: "DATABASE_URL", defaultValue: "postgres://db:5432/main" });
    expect(result[2]).toMatchObject({ key: "SECRET_KEY", isRequired: true });
    expect(result[2].defaultValue).toBeUndefined();
  });

  it("parses mapping-style docker-compose environment variables", () => {
    const yaml = `
services:
  api:
    environment:
      NODE_ENV: production
      LOG_LEVEL: debug
    `;
    const result = parseYamlEnvironment(yaml, { filePath: "docker-compose.yml" });

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({ key: "NODE_ENV", defaultValue: "production" });
    expect(result[1]).toMatchObject({ key: "LOG_LEVEL", defaultValue: "debug" });
  });

  it("strips quotes from quoted values using js-yaml parser", () => {
    const yaml = `
services:
  app:
    environment:
      - VAR="quoted value"
      - SINGLE='single quoted'
    `;
    const result = parseYamlEnvironment(yaml, { filePath: "docker-compose.yml" });

    expect(result).toHaveLength(2);
    expect(result.find((i) => i.key === "VAR")?.defaultValue).toBe("quoted value");
    expect(result.find((i) => i.key === "SINGLE")?.defaultValue).toBe("single quoted");
  });

  it("handles multi-service docker-compose files", () => {
    const yaml = `
services:
  web:
    image: node:18
    environment:
      - NODE_ENV=production
  db:
    image: postgres:16
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: admin
    `;
    const result = parseYamlEnvironment(yaml, { filePath: "docker-compose.yml" });

    expect(result).toHaveLength(3);
    expect(result.map((i) => i.key)).toContain("NODE_ENV");
    expect(result.map((i) => i.key)).toContain("POSTGRES_DB");
    expect(result.map((i) => i.key)).toContain("POSTGRES_USER");
  });

  it("returns empty array for YAML without environment blocks", () => {
    const yaml = `
version: '3.8'
services:
  web:
    image: node:18
    ports:
      - "3000:3000"
    `;
    const result = parseYamlEnvironment(yaml, { filePath: "docker-compose.yml" });
    expect(result).toHaveLength(0);
  });

  it("returns empty array for invalid YAML", () => {
    const result = parseYamlEnvironment("{{{{ not yaml }}}}", { filePath: "invalid.yml" });
    expect(result).toHaveLength(0);
  });
});
