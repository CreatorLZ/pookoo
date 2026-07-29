import { describe, it, expect } from "vitest";
import { evaluateRules, calculateHealthScore } from "../index";
import { KnowledgeGraphData, Finding } from "@pookoo/shared";

describe("evaluateRules", () => {
  it("flags variables with no static reference found", () => {
    const graph: KnowledgeGraphData = {
      nodes: [
        {
          id: "config:UNUSED_KEY",
          kind: "ConfigurationItem",
          label: "UNUSED_KEY",
          metadata: { isRequired: false }
        }
      ],
      edges: []
    };

    const { findings } = evaluateRules(graph);
    expect(findings).toHaveLength(1);
    expect(findings[0].ruleId).toBe("NO_STATIC_REFERENCE_FOUND");
    expect(findings[0].severity).toBe("INFO");
  });

  it("flags public secret leak risk with CRITICAL severity", () => {
    const graph: KnowledgeGraphData = {
      nodes: [
        {
          id: "config:NEXT_PUBLIC_STRIPE_SECRET_KEY",
          kind: "ConfigurationItem",
          label: "NEXT_PUBLIC_STRIPE_SECRET_KEY",
          metadata: { isRequired: true }
        }
      ],
      edges: [
        {
          id: "edge:consumes:1",
          sourceId: "callsite:1",
          targetId: "config:NEXT_PUBLIC_STRIPE_SECRET_KEY",
          kind: "CONSUMES"
        }
      ]
    };

    const { findings, healthScore } = evaluateRules(graph);
    expect(findings.some((f) => f.ruleId === "PUBLIC_PREFIX_SECRET_RISK")).toBe(true);
    expect(findings.some((f) => f.ruleId === "UNDOCUMENTED_REQUIRED_VAR")).toBe(true);
    expect(findings.some((f) => f.ruleId === "FALLBACK_INCONSISTENCY")).toBe(false);
    expect(healthScore).toBeLessThan(100);
  });

  it("does NOT flag publishable keys as secret risks", () => {
    const graph: KnowledgeGraphData = {
      nodes: [
        {
          id: "config:NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
          kind: "ConfigurationItem",
          label: "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
          metadata: { isRequired: false }
        },
        {
          id: "config:NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
          kind: "ConfigurationItem",
          label: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
          metadata: { isRequired: false }
        },
        {
          id: "config:NEXT_PUBLIC_GOOGLE_MAPS_API_KEY",
          kind: "ConfigurationItem",
          label: "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY",
          metadata: { isRequired: false }
        }
      ],
      edges: []
    };

    const { findings } = evaluateRules(graph);
    const secretFindings = findings.filter((f) => f.ruleId === "PUBLIC_PREFIX_SECRET_RISK");
    expect(secretFindings).toHaveLength(0);
  });

  it("still flags genuine public secret leaks", () => {
    const graph: KnowledgeGraphData = {
      nodes: [
        {
          id: "config:NEXT_PUBLIC_DATABASE_PASSWORD",
          kind: "ConfigurationItem",
          label: "NEXT_PUBLIC_DATABASE_PASSWORD",
          metadata: { isRequired: false }
        },
        {
          id: "config:VITE_STRIPE_SECRET_KEY",
          kind: "ConfigurationItem",
          label: "VITE_STRIPE_SECRET_KEY",
          metadata: { isRequired: false }
        }
      ],
      edges: []
    };

    const { findings } = evaluateRules(graph);
    const secretFindings = findings.filter((f) => f.ruleId === "PUBLIC_PREFIX_SECRET_RISK");
    expect(secretFindings).toHaveLength(2);
    expect(secretFindings.every((f) => f.severity === "CRITICAL")).toBe(true);
  });

  it("marks SDK-prefix vars as INFO with no-static-reference", () => {
    const graph: KnowledgeGraphData = {
      nodes: [
        {
          id: "config:CLERK_SECRET_KEY",
          kind: "ConfigurationItem",
          label: "CLERK_SECRET_KEY",
          metadata: { isRequired: false }
        },
        {
          id: "config:STRIPE_PUBLISHABLE_KEY",
          kind: "ConfigurationItem",
          label: "STRIPE_PUBLISHABLE_KEY",
          metadata: { isRequired: false }
        },
        {
          id: "config:MY_CUSTOM_VAR",
          kind: "ConfigurationItem",
          label: "MY_CUSTOM_VAR",
          metadata: { isRequired: false }
        }
      ],
      edges: []
    };

    const { findings } = evaluateRules(graph);
    const noRefFindings = findings.filter((f) => f.ruleId === "NO_STATIC_REFERENCE_FOUND");

    const clerkFinding = noRefFindings.find((f) => f.targetKey === "CLERK_SECRET_KEY");
    const stripeFinding = noRefFindings.find((f) => f.targetKey === "STRIPE_PUBLISHABLE_KEY");
    const customFinding = noRefFindings.find((f) => f.targetKey === "MY_CUSTOM_VAR");

    // All no-static-reference findings are INFO
    expect(clerkFinding?.severity).toBe("INFO");
    expect(stripeFinding?.severity).toBe("INFO");
    expect(customFinding?.severity).toBe("INFO");
  });

  it("detects inconsistent fallback values across call-sites", () => {
    const graph: KnowledgeGraphData = {
      nodes: [
        {
          id: "config:PORT",
          kind: "ConfigurationItem",
          label: "PORT",
          metadata: { isRequired: false, defaultValue: "3000" }
        },
        {
          id: "callsite:server.ts:5",
          kind: "CallSite",
          label: "PORT (DIRECT_MEMBER)",
          metadata: {
            itemKey: "PORT",
            callType: "DIRECT_MEMBER",
            fallbackValue: "3000",
            sourceLocation: { filePath: "src/server.ts", lineNumber: 5 }
          }
        },
        {
          id: "callsite:config.ts:12",
          kind: "CallSite",
          label: "PORT (DIRECT_MEMBER)",
          metadata: {
            itemKey: "PORT",
            callType: "DIRECT_MEMBER",
            fallbackValue: "8080",
            sourceLocation: { filePath: "src/config.ts", lineNumber: 12 }
          }
        }
      ],
      edges: [
        {
          id: "edge:consumes:1",
          sourceId: "callsite:server.ts:5",
          targetId: "config:PORT",
          kind: "CONSUMES"
        },
        {
          id: "edge:consumes:2",
          sourceId: "callsite:config.ts:12",
          targetId: "config:PORT",
          kind: "CONSUMES"
        }
      ]
    };

    const { findings } = evaluateRules(graph);
    const fallbackFindings = findings.filter((f) => f.ruleId === "FALLBACK_INCONSISTENCY");
    expect(fallbackFindings.length).toBeGreaterThanOrEqual(1);
    expect(fallbackFindings[0].targetKey).toBe("PORT");
    expect(fallbackFindings[0].message).toContain("2 distinct fallback values");
    // Raw values must NEVER appear in findings
    expect(fallbackFindings[0].message).not.toContain("3000");
    expect(fallbackFindings[0].message).not.toContain("8080");
  });

  it("does not flag consistent fallback values", () => {
    const graph: KnowledgeGraphData = {
      nodes: [
        {
          id: "config:NODE_ENV",
          kind: "ConfigurationItem",
          label: "NODE_ENV",
          metadata: { isRequired: false }
        },
        {
          id: "callsite:app.ts:3",
          kind: "CallSite",
          label: "NODE_ENV (DESTRUCTURED)",
          metadata: {
            itemKey: "NODE_ENV",
            callType: "DESTRUCTURED",
            fallbackValue: "development",
            sourceLocation: { filePath: "src/app.ts", lineNumber: 3 }
          }
        },
        {
          id: "callsite:db.ts:8",
          kind: "CallSite",
          label: "NODE_ENV (DESTRUCTURED)",
          metadata: {
            itemKey: "NODE_ENV",
            callType: "DESTRUCTURED",
            fallbackValue: "development",
            sourceLocation: { filePath: "src/db.ts", lineNumber: 8 }
          }
        }
      ],
      edges: []
    };

    const { findings } = evaluateRules(graph);
    expect(findings.filter((f) => f.ruleId === "FALLBACK_INCONSISTENCY")).toHaveLength(0);
  });
});

describe("calculateHealthScore", () => {
  it("returns 100 for no findings", () => {
    expect(calculateHealthScore([])).toBe(100);
  });

  it("caps penalty per rule at 30", () => {
    // 4 HIGH findings (10 each = 40) from same rule should be capped at 30
    const findings: Finding[] = Array.from({ length: 4 }, (_, i) => ({
      id: `finding:${i}`,
      ruleId: "NO_STATIC_REFERENCE_FOUND",
      severity: "HIGH" as const,
      targetKey: `VAR_${i}`,
      message: "test",
      explanation: "test",
      remediation: "test"
    }));

    const score = calculateHealthScore(findings);
    expect(score).toBe(70); // 100 - 30 (capped)
  });

  it("does not penalize for INFO findings", () => {
    const findings: Finding[] = Array.from({ length: 10 }, (_, i) => ({
      id: `finding:${i}`,
      ruleId: "NO_STATIC_REFERENCE_FOUND",
      severity: "INFO" as const,
      targetKey: `VAR_${i}`,
      message: "test",
      explanation: "test",
      remediation: "test"
    }));

    const score = calculateHealthScore(findings);
    expect(score).toBe(100);
  });

  it("applies separate caps for different rules", () => {
    const findings: Finding[] = [
      {
        id: "finding:1",
        ruleId: "PUBLIC_PREFIX_SECRET_RISK",
        severity: "CRITICAL",
        targetKey: "VAR_1",
        message: "test",
        explanation: "test",
        remediation: "test"
      },
      {
        id: "finding:2",
        ruleId: "NO_STATIC_REFERENCE_FOUND",
        severity: "HIGH",
        targetKey: "VAR_2",
        message: "test",
        explanation: "test",
        remediation: "test"
      }
    ];

    // CRITICAL=20 (capped at 30, so 20) + HIGH=10 (capped at 30, so 10) = 30
    const score = calculateHealthScore(findings);
    expect(score).toBe(70);
  });
});

describe("SAFETY: fallback secrets never leak through any reporter", () => {
  const SECRET_A = "dummy_live_SuperSecretStripeKeyAlpha123";
  const SECRET_B = "dummy_live_SuperSecretStripeKeyBeta456";

  const graphWithSecretFallbacks: KnowledgeGraphData = {
    nodes: [
      {
        id: "config:API_KEY",
        kind: "ConfigurationItem",
        label: "API_KEY",
        metadata: { isRequired: true }
      },
      {
        id: "callsite:src/a.ts:10",
        kind: "CallSite",
        label: "API_KEY (DIRECT_MEMBER)",
        metadata: {
          itemKey: "API_KEY",
          callType: "DIRECT_MEMBER",
          fallbackValue: SECRET_A,
          sourceLocation: { filePath: "src/a.ts", lineNumber: 10 }
        }
      },
      {
        id: "callsite:src/b.ts:20",
        kind: "CallSite",
        label: "API_KEY (DIRECT_MEMBER)",
        metadata: {
          itemKey: "API_KEY",
          callType: "DIRECT_MEMBER",
          fallbackValue: SECRET_B,
          sourceLocation: { filePath: "src/b.ts", lineNumber: 20 }
        }
      }
    ],
    edges: [
      { id: "edge:1", sourceId: "callsite:src/a.ts:10", targetId: "config:API_KEY", kind: "CONSUMES" },
      { id: "edge:2", sourceId: "callsite:src/b.ts:20", targetId: "config:API_KEY", kind: "CONSUMES" }
    ]
  };

  it("rule findings never contain secret fallback literals", () => {
    const { findings } = evaluateRules(graphWithSecretFallbacks);
    const fallbackFindings = findings.filter((f) => f.ruleId === "FALLBACK_INCONSISTENCY");

    expect(fallbackFindings.length).toBeGreaterThanOrEqual(1);

    const allText = fallbackFindings.map((f) => `${f.message} ${f.explanation} ${f.remediation}`).join(" ");
    expect(allText).not.toContain(SECRET_A);
    expect(allText).not.toContain(SECRET_B);
  });

  it("JSON reporter never contains secret fallback literals", async () => {
    const { formatJsonReport } = await import("../../reporter/json.js");
    const { findings, healthScore } = evaluateRules(graphWithSecretFallbacks);
    const result = {
      knowledgeGraph: graphWithSecretFallbacks,
      findings,
      healthScore,
      scannedFilesCount: 2
    };

    const json = formatJsonReport(result);
    expect(json).not.toContain(SECRET_A);
    expect(json).not.toContain(SECRET_B);
    expect(json).toContain("API_KEY"); // key name is safe
  });

  it("terminal reporter never contains secret fallback literals", async () => {
    const { formatTerminalReport } = await import("../../reporter/terminal.js");
    const { findings, healthScore } = evaluateRules(graphWithSecretFallbacks);
    const result = {
      knowledgeGraph: graphWithSecretFallbacks,
      findings,
      healthScore,
      scannedFilesCount: 2
    };

    const output = formatTerminalReport(result);
    expect(output).not.toContain(SECRET_A);
    expect(output).not.toContain(SECRET_B);
  });

  it("markdown reporter never contains secret fallback literals", async () => {
    const { formatMarkdownReport } = await import("../../reporter/markdown.js");
    const { findings, healthScore } = evaluateRules(graphWithSecretFallbacks);
    const result = {
      knowledgeGraph: graphWithSecretFallbacks,
      findings,
      healthScore,
      scannedFilesCount: 2
    };

    const output = formatMarkdownReport(result);
    expect(output).not.toContain(SECRET_A);
    expect(output).not.toContain(SECRET_B);
  });
});
