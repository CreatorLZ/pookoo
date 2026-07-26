import { Finding, KnowledgeGraphData, RuleDefinition } from "@pookoo/shared";

const SENSITIVE_KEYWORDS = ["SECRET", "KEY", "TOKEN", "PASSWORD", "PRIVATE", "AUTH"];

export const publicSecretRiskRule: RuleDefinition = {
  id: "PUBLIC_PREFIX_SECRET_RISK",
  name: "Public Client Secret Leak Risk",
  description: "Detects variables using public framework client prefixes that contain sensitive keywords.",
  defaultSeverity: "CRITICAL",
  evaluate(graph: KnowledgeGraphData): Finding[] {
    const findings: Finding[] = [];
    const itemNodes = graph.nodes.filter((n) => n.kind === "ConfigurationItem");

    for (const itemNode of itemNodes) {
      const key = itemNode.label;
      const isPublicPrefix = key.startsWith("NEXT_PUBLIC_") || key.startsWith("VITE_") || key.startsWith("REACT_APP_");

      if (isPublicPrefix) {
        const containsSecretKeyword = SENSITIVE_KEYWORDS.some((kw) => key.toUpperCase().includes(kw));
        if (containsSecretKeyword) {
          findings.push({
            id: `finding:publicsecret:${key}`,
            ruleId: "PUBLIC_PREFIX_SECRET_RISK",
            severity: "CRITICAL",
            targetKey: key,
            message: `Public client variable '${key}' contains a sensitive keyword (${SENSITIVE_KEYWORDS.filter(kw => key.includes(kw)).join(", ")}).`,
            explanation: "Public client framework prefixes expose variables to client-side browser bundles, creating credential leak risks.",
            remediation: `Rename '${key}' to a server-only variable without public client prefixes if it contains private credentials.`
          });
        }
      }
    }

    return findings;
  }
};

