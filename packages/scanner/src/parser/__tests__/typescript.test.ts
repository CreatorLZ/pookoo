import { describe, it, expect } from "vitest";
import { parseTypeScriptSource } from "../typescript";

describe("parseTypeScriptSource", () => {
  it("extracts direct process.env member accessors", () => {
    const code = `
const port = process.env.PORT || "3000";
const dbUrl = process.env.DATABASE_URL;
    `;
    const usages = parseTypeScriptSource(code, { filePath: "src/server.ts" });

    expect(usages).toHaveLength(2);
    expect(usages[0]).toMatchObject({
      itemKey: "PORT",
      callType: "DIRECT_MEMBER",
      fallbackValue: "3000"
    });
    expect(usages[1]).toMatchObject({
      itemKey: "DATABASE_URL",
      callType: "DIRECT_MEMBER",
      fallbackValue: undefined
    });
  });

  it("extracts destructured process.env declarations with default fallbacks", () => {
    const code = `
const { PORT = "8080", HOST, NODE_ENV = "development" } = process.env;
    `;
    const usages = parseTypeScriptSource(code, { filePath: "src/config.ts" });

    expect(usages).toHaveLength(3);
    expect(usages[0]).toMatchObject({
      itemKey: "PORT",
      callType: "DESTRUCTURED",
      fallbackValue: "8080"
    });
    expect(usages[1]).toMatchObject({
      itemKey: "HOST",
      callType: "DESTRUCTURED",
      fallbackValue: undefined
    });
    expect(usages[2]).toMatchObject({
      itemKey: "NODE_ENV",
      callType: "DESTRUCTURED",
      fallbackValue: "development"
    });
  });

  it("extracts framework public prefix accesses (import.meta.env)", () => {
    const code = `
const apiKey = import.meta.env.VITE_API_KEY;
    `;
    const usages = parseTypeScriptSource(code, { filePath: "src/client.ts" });

    expect(usages).toHaveLength(1);
    expect(usages[0]).toMatchObject({
      itemKey: "VITE_API_KEY",
      callType: "FRAMEWORK_PUBLIC"
    });
  });

  it("flags dynamic computed indexing expressions", () => {
    const code = `
const key = "DYNAMIC_KEY";
const val = process.env[key];
    `;
    const usages = parseTypeScriptSource(code, { filePath: "src/dynamic.ts" });

    expect(usages).toHaveLength(1);
    expect(usages[0]).toMatchObject({
      itemKey: "<DYNAMIC_COMPUTED>",
      callType: "DYNAMIC_COMPUTED"
    });
  });
});
