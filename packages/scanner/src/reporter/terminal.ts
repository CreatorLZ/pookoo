import { ScanResult, Finding } from "@pookoo/shared";
import pc from "picocolors";

function severityColor(severity: string): (s: string) => string {
  switch (severity) {
    case "CRITICAL":
      return pc.red;
    case "HIGH":
      return pc.yellow;
    case "MEDIUM":
      return pc.blue;
    case "LOW":
      return pc.cyan;
    default:
      return pc.dim;
  }
}

function truncate(s: string, max = 80): string {
  return s.length > max ? s.slice(0, max) + "…" : s;
}

export function formatTerminalReport(result: ScanResult): string {
  const lines: string[] = [];

  lines.push(pc.bold("Pookoo Configuration Report"));
  lines.push(pc.dim("───────────────────────────"));
  lines.push(`Scanned:  ${result.scannedFilesCount} files`);
  lines.push(`Findings: ${result.findings.length} issues`);

  if (result.findings.length === 0) {
    const varCount = result.knowledgeGraph.nodes.filter(n => n.kind === "ConfigurationItem").length;
    const varText = varCount === 1 ? "environment variable" : "environment variables";
    lines.push(`\n${pc.green("✔")} No issues found across ${varCount} ${varText}\n`);
    return lines.join("\n");
  }
  lines.push("");

  const bySeverity: Record<string, Finding[]> = {};
  for (const f of result.findings) {
    (bySeverity[f.severity] ??= []).push(f);
  }

  const severityOrder = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"];
  let first = true;

  for (const sev of severityOrder) {
    const bucket = bySeverity[sev];
    if (!bucket || bucket.length === 0) continue;
    if (!first) lines.push("");
    first = false;

    const color = severityColor(sev);

    if (bucket.every((f) => f.ruleId === "NO_STATIC_REFERENCE_FOUND")) {
      const keys = bucket.map((f) => f.targetKey).join(", ");
      lines.push(`${color("●")} ${pc.bold(`[${sev}] Unreferenced Variables (${bucket.length})`)}`);
      lines.push(`  ${pc.dim("These variables are declared in config but never statically referenced in your code.")}`);
      lines.push(`  ${pc.dim("They might be unused, or consumed dynamically by scripts/frameworks.")}`);
      lines.push(`  → ${keys}`);
      continue;
    }

    const grouped: Record<string, Finding[]> = {};
    for (const f of bucket) {
      (grouped[f.targetKey] ??= []).push(f);
    }

    for (const [key, findings] of Object.entries(grouped)) {
      const f = findings[0];
      const countLabel = findings.length > 1 ? ` (${findings.length})` : "";
      lines.push(`${color("●")} ${pc.bold(`[${sev}] ${key}`)}${pc.dim(countLabel)}`);

      if (f.ruleId === "FALLBACK_INCONSISTENCY") {
        const values = [...new Set(findings.map((x) => x.message))].map((v) => truncate(v, 80));
        lines.push(`  ${pc.dim("Conflicting fallbacks:")}`);
        for (const v of values) lines.push(`    - ${v}`);
      } else {
        lines.push(`  ${pc.dim(truncate(f.message, 100))}`);
      }

      if (f.sourceLocation) {
        lines.push(`  ${pc.dim(`File: ${f.sourceLocation.filePath}:${f.sourceLocation.lineNumber}`)}`);
      }

      const shortFix = f.remediation.length > 120 ? truncate(f.remediation, 120) : f.remediation;
      lines.push(`  ${pc.dim(`Fix:  ${shortFix}`)}\n`);
    }
  }

  lines.push("");
  return lines.join("\n");
}
