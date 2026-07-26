import { describe, it, expect } from "vitest";
import { buildKnowledgeGraph } from "../index";
import { ConfigurationItem, Usage } from "@configiq/shared";

describe("buildKnowledgeGraph", () => {
  it("builds DAG nodes and edges connecting files, items, and call-sites", () => {
    const items: ConfigurationItem[] = [
      {
        key: "PORT",
        sourceLocation: { filePath: ".env", lineNumber: 1, columnRange: [1, 10] },
        defaultValue: "3000",
        isRequired: false
      }
    ];

    const usages: Usage[] = [
      {
        id: "src/server.ts:2:10",
        itemKey: "PORT",
        sourceLocation: { filePath: "src/server.ts", lineNumber: 2, columnRange: [10, 25] },
        accessorPattern: "process.env.PORT",
        callType: "DIRECT_MEMBER"
      }
    ];

    const graph = buildKnowledgeGraph(items, usages);

    expect(graph.nodes.length).toBeGreaterThanOrEqual(3);
    expect(graph.edges.length).toBe(2);

    const declaresEdge = graph.edges.find((e) => e.kind === "DECLARES");
    expect(declaresEdge?.targetId).toBe("config:PORT");

    const consumesEdge = graph.edges.find((e) => e.kind === "CONSUMES");
    expect(consumesEdge?.targetId).toBe("config:PORT");
  });

  it("creates additional DECLARES edges when extraDeclarations are provided", () => {
    const items: ConfigurationItem[] = [
      {
        key: "PORT",
        sourceLocation: { filePath: ".env", lineNumber: 1, columnRange: [1, 10] },
        defaultValue: "3000",
        isRequired: false
      }
    ];

    const extraDeclarations = new Map<string, string[]>([
      ["PORT", [".env", ".env.local", ".env.production"]]
    ]);

    const graph = buildKnowledgeGraph(items, [], { extraDeclarations });

    const declaresEdges = graph.edges.filter((e) => e.kind === "DECLARES");
    expect(declaresEdges).toHaveLength(3);

    const declareFiles = declaresEdges.map((e) => e.sourceId);
    expect(declareFiles).toContain("file:.env");
    expect(declareFiles).toContain("file:.env.local");
    expect(declareFiles).toContain("file:.env.production");
  });

  it("skips CONSUMES edges for DYNAMIC_COMPUTED usages", () => {
    const items: ConfigurationItem[] = [];

    const usages: Usage[] = [
      {
        id: "src/dynamic.ts:5:10",
        itemKey: "<DYNAMIC_COMPUTED>",
        sourceLocation: { filePath: "src/dynamic.ts", lineNumber: 5, columnRange: [10, 25] },
        accessorPattern: "process.env[key]",
        callType: "DYNAMIC_COMPUTED"
      }
    ];

    const graph = buildKnowledgeGraph(items, usages);

    const consumesEdges = graph.edges.filter((e) => e.kind === "CONSUMES");
    expect(consumesEdges).toHaveLength(0);

    const callSiteNodes = graph.nodes.filter((n) => n.kind === "CallSite");
    expect(callSiteNodes).toHaveLength(1);
  });
});
