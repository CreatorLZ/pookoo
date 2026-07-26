import { Finding, KnowledgeGraphData, RuleDefinition } from "@configiq/shared";

export const noUnreferencedRule: RuleDefinition = {
  id: "NO_UNREFERENCED_ENV_VAR",
  name: "Dead Configuration Variable",
  description: "Detects declared configuration variables that are never referenced in source code call-sites.",
  defaultSeverity: "HIGH",
  evaluate(graph: KnowledgeGraphData): Finding[] {
    const findings: Finding[] = [];
    const itemNodes = graph.nodes.filter((n) => n.kind === "ConfigurationItem");
    const consumesEdges = graph.edges.filter((e) => e.kind === "CONSUMES");

    // Variables implicitly consumed by Node.js runtime or popular frameworks
    // without requiring explicit process.env references in source code.
    const IMPLICIT_VARIABLES = new Set([
      "NODE_ENV",
      "NODE_OPTIONS",
      "NODE_PATH",
      "NODE_DEBUG",
      "NODE_NO_WARNINGS",
      "NODE_EXTRA_CA_CERTS",
      "NODE_TLS_REJECT_UNAUTHORIZED",
      "UPLOADTHING_TOKEN",
      "UPLOADTHING_SECRET",
      "UPLOADTHING_APP_ID"
    ]);

    for (const itemNode of itemNodes) {
      if (IMPLICIT_VARIABLES.has(itemNode.label)) {
        continue; // Skip flagging implicitly consumed known variables
      }

      const isConsumed = consumesEdges.some((e) => e.targetId === itemNode.id);
      if (!isConsumed) {
        findings.push({
          id: `finding:unreferenced:${itemNode.label}`,
          ruleId: "NO_UNREFERENCED_ENV_VAR",
          severity: "HIGH",
          targetKey: itemNode.label,
          message: `Variable '${itemNode.label}' is declared but never referenced in source code.`,
          explanation: "Unreferenced configuration variables increase cognitive debt and may indicate abandoned features.",
          remediation: `Remove '${itemNode.label}' from configuration files if it is no longer required.`
        });
      }
    }

    return findings;
  }
};
