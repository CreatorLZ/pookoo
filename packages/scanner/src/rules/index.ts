import { Finding, KnowledgeGraphData, RuleDefinition, Severity } from "@configiq/shared";
import { noUnreferencedRule } from "./noUnreferenced";
import { undocumentedRequiredRule } from "./undocumentedRequired";
import { publicSecretRiskRule } from "./publicSecretRisk";
import { fallbackInconsistencyRule } from "./fallbackInconsistency";

export const BUILTIN_RULES: RuleDefinition[] = [
  noUnreferencedRule,
  undocumentedRequiredRule,
  publicSecretRiskRule,
  fallbackInconsistencyRule
];

const SEVERITY_WEIGHTS: Record<Severity, number> = {
  CRITICAL: 25,
  HIGH: 15,
  MEDIUM: 8,
  LOW: 4,
  INFO: 1
};

export function calculateHealthScore(findings: Finding[]): number {
  let penaltySum = 0;
  for (const finding of findings) {
    penaltySum += SEVERITY_WEIGHTS[finding.severity] || 0;
  }
  const score = Math.max(0, 100 - penaltySum);
  return Math.round(score * 10) / 10;
}

export function evaluateRules(
  graph: KnowledgeGraphData,
  rules: RuleDefinition[] = BUILTIN_RULES
): { findings: Finding[]; healthScore: number } {
  const findings: Finding[] = [];

  for (const rule of rules) {
    const ruleFindings = rule.evaluate(graph);
    findings.push(...ruleFindings);
  }

  const healthScore = calculateHealthScore(findings);

  return { findings, healthScore };
}
