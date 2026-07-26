import { describe, it, expect } from "vitest";
import { formatMarkdownReport } from "../markdown";
import { ScanResult } from "@configiq/shared";

describe("formatMarkdownReport", () => {
  it("includes health score and file count", () => {
    const result: ScanResult = {
      knowledgeGraph: { nodes: [], edges: [] },
      findings: [],
      healthScore: 100,
      scannedFilesCount: 7
    };

    const output = formatMarkdownReport(result);
    expect(output).toContain("100/100.0");
    expect(output).toContain("7");
  });

  it("shows note block when no findings", () => {
    const result: ScanResult = {
      knowledgeGraph: { nodes: [], edges: [] },
      findings: [],
      healthScore: 100,
      scannedFilesCount: 5
    };

    const output = formatMarkdownReport(result);
    expect(output).toContain("[!NOTE]");
    expect(output).toContain("No configuration issues detected");
  });

  it("renders finding table and remediation sections", () => {
    const result: ScanResult = {
      knowledgeGraph: { nodes: [], edges: [] },
      findings: [
        {
          id: "finding:1",
          ruleId: "PUBLIC_PREFIX_SECRET_RISK",
          severity: "CRITICAL",
          targetKey: "NEXT_PUBLIC_API_SECRET",
          message: "Public variable contains secret keyword.",
          explanation: "Exposes credentials to client bundles.",
          remediation: "Remove public prefix."
        }
      ],
      healthScore: 75,
      scannedFilesCount: 10
    };

    const output = formatMarkdownReport(result);
    expect(output).toContain("| Severity | Rule ID |");
    expect(output).toContain("CRITICAL");
    expect(output).toContain("NEXT_PUBLIC_API_SECRET");
    expect(output).toContain("Remediation Recommendations");
    expect(output).not.toContain("[!NOTE]");
  });
});
