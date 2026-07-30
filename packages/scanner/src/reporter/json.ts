import { ScanResult, KnowledgeGraphNode } from "@pookoo/shared";

/**
 * Redact secret-bearing metadata from knowledge graph nodes before serialization.
 * Strips `defaultValue` structurally — real .env values must never appear in JSON output.
 */
function redactNodeMetadata(node: KnowledgeGraphNode): KnowledgeGraphNode {
  if (node.kind === "ConfigurationItem") {
    const { defaultValue, ...safeMetadata } = node.metadata as Record<string, unknown> & {
      defaultValue?: unknown;
    };
    return { ...node, metadata: safeMetadata };
  }
  if (node.kind === "CallSite") {
    const { fallbackValue, ...safeMetadata } = node.metadata as Record<string, unknown> & {
      fallbackValue?: unknown;
    };
    return { ...node, metadata: safeMetadata };
  }
  return node;
}

export function formatJsonReport(result: ScanResult): string {
  const { healthScore: _healthScore, ...publicFields } = result;
  const safeResult = {
    ...publicFields,
    knowledgeGraph: {
      ...result.knowledgeGraph,
      nodes: result.knowledgeGraph.nodes.map(redactNodeMetadata)
    }
  };
  return JSON.stringify(safeResult, null, 2);
}
