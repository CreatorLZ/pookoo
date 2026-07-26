import {
  ConfigurationItem,
  Usage,
  KnowledgeGraphData,
  KnowledgeGraphNode,
  KnowledgeGraphEdge
} from "@configiq/shared";

export interface KnowledgeGraphOptions {
  extraDeclarations?: Map<string, string[]>;
}

export function buildKnowledgeGraph(
  items: ConfigurationItem[],
  usages: Usage[],
  options?: KnowledgeGraphOptions
): KnowledgeGraphData {
  const nodes: KnowledgeGraphNode[] = [];
  const edges: KnowledgeGraphEdge[] = [];

  const fileSet = new Set<string>();

  // 1. Add ConfigurationItem Nodes & File Nodes
  for (const item of items) {
    fileSet.add(item.sourceLocation.filePath);

    nodes.push({
      id: `config:${item.key}`,
      kind: "ConfigurationItem",
      label: item.key,
      metadata: {
        defaultValue: item.defaultValue,
        isRequired: item.isRequired,
        inferredFramework: item.inferredFramework,
        rawComment: item.rawComment,
        sourceLocation: item.sourceLocation
      }
    });

    edges.push({
      id: `edge:declares:${item.sourceLocation.filePath}:${item.key}`,
      sourceId: `file:${item.sourceLocation.filePath}`,
      targetId: `config:${item.key}`,
      kind: "DECLARES"
    });

    // Create additional DECLARES edges for files beyond the primary declaration
    if (options?.extraDeclarations) {
      const allFiles = options.extraDeclarations.get(item.key);
      if (allFiles) {
        for (const filePath of allFiles) {
          if (filePath !== item.sourceLocation.filePath) {
            fileSet.add(filePath);
            edges.push({
              id: `edge:declares:${filePath}:${item.key}`,
              sourceId: `file:${filePath}`,
              targetId: `config:${item.key}`,
              kind: "DECLARES"
            });
          }
        }
      }
    }
  }

  // 2. Add Usage Nodes & Consumes Edges
  for (const usage of usages) {
    fileSet.add(usage.sourceLocation.filePath);

    const isDynamic = usage.itemKey === "<DYNAMIC_COMPUTED>";

    nodes.push({
      id: `callsite:${usage.id}`,
      kind: "CallSite",
      label: `${usage.itemKey} (${usage.callType})`,
      metadata: {
        itemKey: usage.itemKey,
        callType: usage.callType,
        fallbackValue: usage.fallbackValue,
        sourceLocation: usage.sourceLocation
      }
    });

    if (!isDynamic) {
      edges.push({
        id: `edge:consumes:${usage.id}:${usage.itemKey}`,
        sourceId: `callsite:${usage.id}`,
        targetId: `config:${usage.itemKey}`,
        kind: "CONSUMES"
      });
    }
  }

  // 3. Add Unique File Nodes
  for (const filePath of fileSet) {
    nodes.push({
      id: `file:${filePath}`,
      kind: "File",
      label: filePath,
      metadata: { filePath }
    });
  }

  return { nodes, edges };
}
