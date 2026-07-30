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

  lines.push(pc.bold(pc.cyan("\n  ╔════════════════════════════════════════╗")));
  lines.push(pc.bold(pc.cyan("  ║       Pookoo Configuration Report       ║")));
  lines.push(pc.bold(pc.cyan("  ╚════════════════════════════════════════╝")));

  lines.push(
    `\n  ${pc.dim("Scanned")} ${pc.white(String(result.scannedFilesCount))} ${pc.dim("files")}  ·  ${pc.dim("Findings")} ${pc.white(String(result.findings.length))}`
  );

  if (result.findings.length === 0) {
    lines.push(`\n  ${pc.green("✔")} ${pc.green("No configuration issues found")}\n`);
    return lines.join("\n");
  }

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
    lines.push(pc.dim(`  ───── ${color(pc.bold(sev))}${pc.dim(" ─" + "─".repeat(50))}`));

    if (bucket.every((f) => f.ruleId === "NO_STATIC_REFERENCE_FOUND")) {
      const keys = bucket.map((f) => pc.white(f.targetKey));
      const finding = bucket[0];
      lines.push(
        `    ${pc.dim("NO_STATIC_REFERENCE_FOUND ·")} ${bucket.length} ${pc.dim("variable" + (bucket.length > 1 ? "s" : "") + " with no static reference")}`
      );
      lines.push(`    ${keys.join(", ")}`);
      lines.push(`    ${pc.dim(finding.explanation)}`);
      if (finding.sourceLocation) {
        lines.push(
          `    ${pc.dim("Source:")} ${finding.sourceLocation.filePath}:${finding.sourceLocation.lineNumber}`
        );
      }
      continue;
    }

    const grouped: Record<string, Finding[]> = {};
    for (const f of bucket) {
      (grouped[f.targetKey] ??= []).push(f);
    }

    for (const findings of Object.values(grouped)) {
      const f = findings[0];
      const tag = color(pc.bold(`[${f.severity}]`));
      lines.push(`  ${tag} ${pc.bold(f.targetKey)}`);
      if (findings.length > 1) lines.push(`    ${pc.dim("Occurrences:")} ${findings.length}`);

      if (f.ruleId === "FALLBACK_INCONSISTENCY") {
        const values = [...new Set(findings.map((x) => x.message))].map((v) => truncate(v, 80));
        lines.push(`    ${pc.dim("Conflicting fallbacks:")}`);
        for (const v of values) lines.push(`      ${v}`);
      } else {
        lines.push(`    ${truncate(f.message, 100)}`);
      }

      if (f.sourceLocation) {
        lines.push(
          `    ${pc.dim("File:")} ${f.sourceLocation.filePath}:${f.sourceLocation.lineNumber}`
        );
      }

      const shortFix = f.remediation.length > 120 ? truncate(f.remediation, 120) : f.remediation;
      lines.push(`    ${pc.dim("Fix:")} ${shortFix}`);
    }
  }

  lines.push("");
  return lines.join("\n");
}
