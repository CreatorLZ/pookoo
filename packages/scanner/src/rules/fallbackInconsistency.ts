import { Finding, KnowledgeGraphData, RuleDefinition } from "@pookoo/shared";

export const fallbackInconsistencyRule: RuleDefinition = {
  id: "FALLBACK_INCONSISTENCY",
  name: "Inconsistent Fallback Values",
  description:
    "Detects configuration variables with different fallback default values across multiple call-sites.",
  defaultSeverity: "MEDIUM",
  evaluate(graph: KnowledgeGraphData): Finding[] {
    const findings: Finding[] = [];

    const callSiteNodes = graph.nodes.filter((n) => n.kind === "CallSite");

    const fallbacksByKey = new Map<
      string,
      Map<string, { filePath: string; lineNumber: number }[]>
    >();

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

      const loc = node.metadata.sourceLocation as
        { filePath: string; lineNumber: number } | undefined;
      if (loc) {
        fallbackMap.get(fallbackValue)!.push({
          filePath: loc.filePath,
          lineNumber: loc.lineNumber
        });
      }
    }

    for (const [itemKey, fallbackMap] of fallbacksByKey) {
      if (fallbackMap.size < 2) continue;

      const distinctCount = fallbackMap.size;
      const allLocations = Array.from(fallbackMap.values()).flat();

      for (const loc of allLocations) {
        findings.push({
          id: `finding:fallback:${itemKey}:${loc.filePath}:${loc.lineNumber}`,
          ruleId: "FALLBACK_INCONSISTENCY",
          severity: "MEDIUM",
          targetKey: itemKey,
          message: `Variable '${itemKey}' has ${distinctCount} distinct fallback values across ${allLocations.length} call-sites.`,
          explanation:
            "Inconsistent fallback values for the same variable create ambiguity about its actual default when the environment variable is unset.",
          remediation: `Standardize the fallback value for '${itemKey}' to a single consistent value across all call-sites.`,
          sourceLocation: {
            filePath: loc.filePath,
            lineNumber: loc.lineNumber,
            columnRange: [0, 0]
          }
        });
      }
    }

    return findings;
  }
};
