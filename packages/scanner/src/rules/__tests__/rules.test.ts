import { describe, it, expect } from "vitest";
import { evaluateRules } from "../index";
import { KnowledgeGraphData } from "@configiq/shared";

describe("evaluateRules", () => {
  it("flags dead configuration variables", () => {
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

    const { findings, healthScore } = evaluateRules(graph);
    expect(findings).toHaveLength(1);
    expect(findings[0].ruleId).toBe("NO_UNREFERENCED_ENV_VAR");
    expect(healthScore).toBe(85);
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
    expect(fallbackFindings).toHaveLength(1);
    expect(fallbackFindings[0].targetKey).toBe("PORT");
    expect(fallbackFindings[0].message).toContain("8080");
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
