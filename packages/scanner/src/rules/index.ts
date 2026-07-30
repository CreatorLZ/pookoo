import { Finding, KnowledgeGraphData, RuleDefinition, Severity } from "@pookoo/shared";
import { noStaticReferenceRule } from "./noUnreferenced";
import { undocumentedRequiredRule } from "./undocumentedRequired";
import { publicSecretRiskRule } from "./publicSecretRisk";
import { fallbackInconsistencyRule } from "./fallbackInconsistency";

export const BUILTIN_RULES: RuleDefinition[] = [
  noStaticReferenceRule,
  undocumentedRequiredRule,
  publicSecretRiskRule,
  fallbackInconsistencyRule
];

const SEVERITY_WEIGHTS: Record<Severity, number> = {
  CRITICAL: 20,
  HIGH: 10,
  MEDIUM: 5,
  LOW: 2,
  INFO: 0
};

const MAX_PENALTY_PER_RULE = 30;

export function calculateHealthScore(findings: Finding[]): number {
  // Group findings by ruleId, then cap the penalty per rule
  const penaltiesByRule = new Map<string, number>();

  for (const finding of findings) {
    const weight = SEVERITY_WEIGHTS[finding.severity] || 0;
    const current = penaltiesByRule.get(finding.ruleId) || 0;
    penaltiesByRule.set(finding.ruleId, current + weight);
  }

  let totalPenalty = 0;
  for (const [, penalty] of penaltiesByRule) {
    totalPenalty += Math.min(penalty, MAX_PENALTY_PER_RULE);
  }

  const score = Math.max(0, 100 - totalPenalty);
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
