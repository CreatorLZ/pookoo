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
    expect(parsed.scannedFilesCount).toBe(1);
    expect(parsed.healthScore).toBeUndefined();
  });

  it("includes findings in output", () => {
    const result: ScanResult = {
      knowledgeGraph: { nodes: [], edges: [] },
      findings: [
        {
          id: "f1",
          ruleId: "NO_STATIC_REFERENCE_FOUND",
          severity: "INFO",
          targetKey: "DEAD_KEY",
          message: "No static reference found.",
          explanation: "Not used in source.",
          remediation: "Investigate."
        }
      ],
      healthScore: 100,
      scannedFilesCount: 5
    };

    const output = formatJsonReport(result);
    const parsed = JSON.parse(output);
    expect(parsed.findings).toHaveLength(1);
    expect(parsed.findings[0].ruleId).toBe("NO_STATIC_REFERENCE_FOUND");
  });

  it("SAFETY: never includes real .env values in JSON output", () => {
    const result: ScanResult = {
      knowledgeGraph: {
        nodes: [
          {
            id: "config:STRIPE_SECRET_KEY",
            kind: "ConfigurationItem",
            label: "STRIPE_SECRET_KEY",
            metadata: {
              isRequired: true,
              defaultValue: "dummy_live_51SMMJBI92XLV9f6YRealProductionKey",
              rawComment: "Stripe API key"
            }
          },
          {
            id: "config:DATABASE_URL",
            kind: "ConfigurationItem",
            label: "DATABASE_URL",
            metadata: {
              isRequired: true,
              defaultValue: "postgres://admin:s3cretP@ss@prod.db.example.com:5432/myapp"
            }
          },
          {
            id: "callsite:server.ts:5",
            kind: "CallSite",
            label: "STRIPE_SECRET_KEY (DIRECT_MEMBER)",
            metadata: {
              itemKey: "STRIPE_SECRET_KEY",
              callType: "DIRECT_MEMBER",
              fallbackValue: "dummy_test_fallbackSecretValue",
              sourceLocation: { filePath: "src/server.ts", lineNumber: 5 }
            }
          }
        ],
        edges: []
      },
      findings: [],
      healthScore: 100,
      scannedFilesCount: 3
    };

    const output = formatJsonReport(result);

    // Real secret values must NEVER appear in JSON output
    expect(output).not.toContain("dummy_live_51SMMJBI92XLV9f6YRealProductionKey");
    expect(output).not.toContain("s3cretP@ss");
    expect(output).not.toContain("postgres://admin");
    expect(output).not.toContain("dummy_test_fallbackSecretValue");

    // Key names and safe metadata must still be present
    expect(output).toContain("STRIPE_SECRET_KEY");
    expect(output).toContain("DATABASE_URL");
    expect(output).toContain("Stripe API key");
    expect(output).toContain("src/server.ts");

    // Verify structurally: defaultValue and fallbackValue fields are absent
    const parsed = JSON.parse(output);
    const configNode = parsed.knowledgeGraph.nodes.find(
      (n: Record<string, unknown>) => n.id === "config:STRIPE_SECRET_KEY"
    );
    expect(configNode.metadata.defaultValue).toBeUndefined();
    expect(configNode.metadata.rawComment).toBe("Stripe API key");

    const callSiteNode = parsed.knowledgeGraph.nodes.find(
      (n: Record<string, unknown>) => n.id === "callsite:server.ts:5"
    );
    expect(callSiteNode.metadata.fallbackValue).toBeUndefined();
    expect(callSiteNode.metadata.sourceLocation).toBeDefined();
  });
});
