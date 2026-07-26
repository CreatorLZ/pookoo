import { describe, it, expect } from "vitest";
import { scan } from "../scan";
import * as path from "path";

describe("scan end-to-end pipeline", () => {
  it("scans repository directory and returns ScanResult", () => {
    const repoRoot = path.resolve(__dirname, "../../..");
    const result = scan(repoRoot);

    expect(result.scannedFilesCount).toBeGreaterThan(0);
    expect(result.healthScore).toBeGreaterThanOrEqual(0);
    expect(result.healthScore).toBeLessThanOrEqual(100);
    expect(result.findings).toBeDefined();
    expect(result.knowledgeGraph).toBeDefined();
  });
});
