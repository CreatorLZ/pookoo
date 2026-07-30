import { Finding, KnowledgeGraphData, RuleDefinition } from "@pookoo/shared";

export const undocumentedRequiredRule: RuleDefinition = {
  id: "UNDOCUMENTED_REQUIRED_VAR",
  name: "Undocumented Required Variable",
  description:
    "Detects required configuration variables that lack inline comments or schema documentation.",
  defaultSeverity: "MEDIUM",
  evaluate(graph: KnowledgeGraphData): Finding[] {
    const findings: Finding[] = [];
    const itemNodes = graph.nodes.filter((n) => n.kind === "ConfigurationItem");

    for (const itemNode of itemNodes) {
      const isRequired = itemNode.metadata.isRequired as boolean;
      const rawComment = itemNode.metadata.rawComment as string | undefined;

      if (isRequired && (!rawComment || !rawComment.trim())) {
        findings.push({
          id: `finding:undocumented:${itemNode.label}`,
          ruleId: "UNDOCUMENTED_REQUIRED_VAR",
          severity: "MEDIUM",
          targetKey: itemNode.label,
          message: `Required variable '${itemNode.label}' lacks documentation comments.`,
          explanation:
            "Required variables without documentation increase onboarding friction for developers.",
          remediation: `Add an inline comment above '${itemNode.label}' explaining its purpose and required format.`
        });
      }
    }

    return findings;
  }
};
