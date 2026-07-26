import { Finding, KnowledgeGraphData, RuleDefinition } from "@configiq/shared";

export const fallbackInconsistencyRule: RuleDefinition = {
  id: "FALLBACK_INCONSISTENCY",
  name: "Inconsistent Fallback Values",
  description: "Detects configuration variables with different fallback default values across multiple call-sites.",
  defaultSeverity: "MEDIUM",
  evaluate(graph: KnowledgeGraphData): Finding[] {
    const findings: Finding[] = [];

    const callSiteNodes = graph.nodes.filter((n) => n.kind === "CallSite");

    const fallbacksByKey = new Map<string, Map<string, { filePath: string; lineNumber: number }[]>>();

    for (const node of callSiteNodes) {
      const itemKey = node.metadata.itemKey as string | undefined;
      const fallbackValue = node.metadata.fallbackValue as string | undefined;

      if (!itemKey || itemKey === "<DYNAMIC_COMPUTED>" || !fallbackValue) continue;

      if (!fallbacksByKey.has(itemKey)) {
        fallbacksByKey.set(itemKey, new Map());
      }

      const fallbackMap = fallbacksByKey.get(itemKey)!;
      if (!fallbackMap.has(fallbackValue)) {
        fallbackMap.set(fallbackValue, []);
      }

      const loc = node.metadata.sourceLocation as { filePath: string; lineNumber: number } | undefined;
      if (loc) {
        fallbackMap.get(fallbackValue)!.push({
          filePath: loc.filePath,
          lineNumber: loc.lineNumber
        });
      }
    }

    for (const [itemKey, fallbackMap] of fallbacksByKey) {
      if (fallbackMap.size < 2) continue;

      const fallbackList = Array.from(fallbackMap.entries());
      const primaryFallback = fallbackList[0][0];

      for (const [fallbackValue, locations] of fallbackList) {
        if (fallbackValue === primaryFallback) continue;

        for (const loc of locations) {
          findings.push({
            id: `finding:fallback:${itemKey}:${loc.filePath}:${loc.lineNumber}`,
            ruleId: "FALLBACK_INCONSISTENCY",
            severity: "MEDIUM",
            targetKey: itemKey,
            message: `Variable '${itemKey}' has inconsistent fallback value '${fallbackValue}' (expected '${primaryFallback}' based on other call-sites).`,
            explanation: "Inconsistent fallback values for the same variable create ambiguity about its actual default when the environment variable is unset.",
            remediation: `Standardize the fallback value for '${itemKey}' to '${primaryFallback}' across all call-sites or document the intended default.`,
            sourceLocation: {
              filePath: loc.filePath,
              lineNumber: loc.lineNumber,
              columnRange: [0, 0]
            }
          });
        }
      }
    }

    return findings;
  }
};
