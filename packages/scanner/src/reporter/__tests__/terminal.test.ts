import { describe, it, expect } from "vitest";
import { formatTerminalReport } from "../terminal";
import { ScanResult } from "@pookoo/shared";

describe("formatTerminalReport", () => {
  it("includes file count in summary", () => {
    const result: ScanResult = {
      knowledgeGraph: { nodes: [], edges: [] },
      findings: [],
      healthScore: 95.5,
      scannedFilesCount: 42
    };

    const output = formatTerminalReport(result);
    expect(output).toContain("42");
    expect(output).toContain("Pookoo");
    expect(output).not.toContain("Score");
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
          ruleId: "NO_STATIC_REFERENCE_FOUND",
          severity: "INFO",
          targetKey: "OLD_KEY",
          message: "No static source-code reference found for 'OLD_KEY'.",
          explanation: "No direct process.env reference was found.",
          remediation: "Investigate whether 'OLD_KEY' is still required."
        }
      ],
      healthScore: 100,
      scannedFilesCount: 10
    };

    const output = formatTerminalReport(result);
    expect(output).toContain("INFO");
    expect(output).toContain("Unreferenced Variables");
    expect(output).toContain("OLD_KEY");
    expect(output).not.toContain("No configuration issues");
  });
});
