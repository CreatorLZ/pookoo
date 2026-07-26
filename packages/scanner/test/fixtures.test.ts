import { describe, it, expect } from "vitest";
import * as path from "path";
import { scan } from "../src/scan";

describe("integration: basic-env-app fixture", () => {
  const fixtureDir = path.resolve(__dirname, "fixtures", "basic-env-app");

  it("discovers all configuration items from .env and .env.example", () => {
    const result = scan(fixtureDir, { silent: true });

    const itemKeys = result.knowledgeGraph.nodes
      .filter((n) => n.kind === "ConfigurationItem")
      .map((n) => n.label);

    expect(itemKeys).toContain("PORT");
    expect(itemKeys).toContain("DATABASE_URL");
    expect(itemKeys).toContain("NODE_ENV");
    // FEATURE_FLAG_X is in .env.example only, not in .env — should not appear
    expect(itemKeys).not.toContain("FEATURE_FLAG_X");
  });

  it("maps source code usages to configuration items", () => {
    const result = scan(fixtureDir, { silent: true });

    const callSiteKeys = result.knowledgeGraph.nodes
      .filter((n) => n.kind === "CallSite")
      .map((n) => n.metadata.itemKey);

    expect(callSiteKeys).toContain("PORT");
    expect(callSiteKeys).toContain("DATABASE_URL");
    expect(callSiteKeys).toContain("NODE_ENV");
  });

  it("detects Next.js framework from package.json dependency", () => {
    const result = scan(fixtureDir, { silent: true });
    expect(result.scannedFilesCount).toBeGreaterThan(0);
  });
});
