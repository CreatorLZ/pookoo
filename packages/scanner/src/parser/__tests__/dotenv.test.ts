import { describe, it, expect } from "vitest";
import { parseDotenv } from "../dotenv";

describe("parseDotenv", () => {
  it("parses simple key=value pairs", () => {
    const content = `
PORT=3000
DATABASE_URL=postgres://localhost:5432/db
    `;
    const result = parseDotenv(content, { filePath: ".env" });

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      key: "PORT",
      defaultValue: "3000",
      isRequired: false,
      sourceLocation: { filePath: ".env", lineNumber: 2 }
    });
    expect(result[1]).toMatchObject({
      key: "DATABASE_URL",
      defaultValue: "postgres://localhost:5432/db",
      isRequired: false
    });
  });

  it("handles double and single quoted values", () => {
    const content = `
API_TITLE="ConfigIQ Reasoning Engine"
SECRET_KEY='super-secret-key-123'
    `;
    const result = parseDotenv(content, { filePath: ".env" });

    expect(result).toHaveLength(2);
    expect(result[0].defaultValue).toBe("ConfigIQ Reasoning Engine");
    expect(result[1].defaultValue).toBe("super-secret-key-123");
  });

  it("parses export prefixes and comments", () => {
    const content = `
# Database configuration comment
export DB_PORT=5432 # Inline port comment
    `;
    const result = parseDotenv(content, { filePath: ".env" });

    expect(result).toHaveLength(1);
    expect(result[0].key).toBe("DB_PORT");
    expect(result[0].defaultValue).toBe("5432");
    expect(result[0].rawComment).toContain("Database configuration comment");
    expect(result[0].rawComment).toContain("Inline port comment");
  });

  it("identifies required variables without default values", () => {
    const content = `
REQUIRED_VAR=
    `;
    const result = parseDotenv(content, { filePath: ".env" });

    expect(result).toHaveLength(1);
    expect(result[0].key).toBe("REQUIRED_VAR");
    expect(result[0].isRequired).toBe(true);
    expect(result[0].defaultValue).toBeUndefined();
  });
});
