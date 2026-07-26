import { describe, it, expect } from "vitest";
import { formatTerminalReport } from "../terminal";
import { ScanResult } from "@pookoo/shared";

describe("formatTerminalReport", () => {
  it("includes health score and file count", () => {
    const result: ScanResult = {
      knowledgeGraph: { nodes: [], edges: [] },
      findings: [],
      healthScore: 95.5,
      scannedFilesCount: 42
    };

    const output = formatTerminalReport(result);
    expect(output).toContain("95.5");
    expect(output).toContain("42");
    expect(output).toContain("Pookoo");
  });

  it("shows success message when no findings", () => {
    const result: ScanResult = {
      knowledgeGraph: { nodes: [], edges: [] },
      findings: [],
      healthScore: 100,
      scannedFilesCount: 10
    };

    const output = formatTerminalReport(result);
    expect(output).toContain("No configuration issues");
  });

  it("lists findings with severity badges when findings exist", () => {
    const result: ScanResult = {
      knowledgeGraph: { nodes: [], edges: [] },
      findings: [
        {
          id: "finding:1",
          ruleId: "NO_UNREFERENCED_ENV_VAR",
          severity: "HIGH",
          targetKey: "OLD_KEY",
          message: "Variable 'OLD_KEY' is unreferenced.",
          explanation: "Dead config increases cognitive debt.",
          remediation: "Remove OLD_KEY if no longer needed."
        }
      ],
      healthScore: 85,
      scannedFilesCount: 10
    };

    const output = formatTerminalReport(result);
    expect(output).toContain("HIGH");
    expect(output).toContain("NO_UNREFERENCED_ENV_VAR");
    expect(output).toContain("OLD_KEY");
    expect(output).not.toContain("No configuration issues");
  });
});

