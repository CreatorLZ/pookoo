import { describe, it, expect } from "vitest";
import { formatJsonReport } from "../json";
import { ScanResult } from "@pookoo/shared";

describe("formatJsonReport", () => {
  it("returns valid JSON string", () => {
    const result: ScanResult = {
      knowledgeGraph: { nodes: [], edges: [] },
      findings: [],
      healthScore: 100,
      scannedFilesCount: 1
    };

    const output = formatJsonReport(result);
    const parsed = JSON.parse(output);
    expect(parsed.healthScore).toBe(100);
    expect(parsed.scannedFilesCount).toBe(1);
  });

  it("includes findings in output", () => {
    const result: ScanResult = {
      knowledgeGraph: { nodes: [], edges: [] },
      findings: [
        {
          id: "f1",
          ruleId: "NO_UNREFERENCED_ENV_VAR",
          severity: "HIGH",
          targetKey: "DEAD_KEY",
          message: "Unreferenced variable.",
          explanation: "Not used in source.",
          remediation: "Delete it."
        }
      ],
      healthScore: 85,
      scannedFilesCount: 5
    };

    const output = formatJsonReport(result);
    const parsed = JSON.parse(output);
    expect(parsed.findings).toHaveLength(1);
    expect(parsed.findings[0].ruleId).toBe("NO_UNREFERENCED_ENV_VAR");
    expect(parsed.healthScore).toBe(85);
  });
});

