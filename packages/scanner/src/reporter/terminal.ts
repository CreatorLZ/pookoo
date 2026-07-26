import { ScanResult } from "@configiq/shared";
import pc from "picocolors";

function severityColor(severity: string): (s: string) => string {
  switch (severity) {
    case "CRITICAL": return pc.red;
    case "HIGH": return pc.yellow;
    case "MEDIUM": return pc.blue;
    case "LOW": return pc.cyan;
    default: return pc.dim;
  }
}

export function formatTerminalReport(result: ScanResult): string {
  const lines: string[] = [];

  lines.push(pc.bold(pc.cyan("\n╔══════════════════════════════════════════════════╗")));
  lines.push(pc.bold(pc.cyan("║     ConfigIQ Configuration Reasoning Engine     ║")));
  lines.push(pc.bold(pc.cyan("╚══════════════════════════════════════════════════╝")));

  lines.push(`\n${pc.dim("Scanned Files:")} ${pc.white(String(result.scannedFilesCount))}`);
  lines.push(`${pc.dim("Health Score :")} ${result.healthScore >= 80 ? pc.green(String(result.healthScore) + "/100.0") : result.healthScore >= 50 ? pc.yellow(String(result.healthScore) + "/100.0") : pc.red(String(result.healthScore) + "/100.0")}`);

  if (result.findings.length === 0) {
    lines.push(`\n${pc.green("✔")} ${pc.green("No configuration issues or risks detected!")}\n`);
    return lines.join("\n");
  }

  lines.push(`\n${pc.bold(pc.white("Diagnostic Findings:"))} ${pc.dim(`(${result.findings.length} total)`)}\n`);

  for (const finding of result.findings) {
    const color = severityColor(finding.severity);
    const badge = color(pc.bold(`[${finding.severity}]`));
    lines.push(`${badge} ${pc.bold(finding.ruleId)}: ${finding.message}`);
    lines.push(`  ${pc.dim("Target Key :")} ${pc.white(finding.targetKey)}`);
    lines.push(`  ${pc.dim("Explanation:")} ${finding.explanation}`);
    lines.push(`  ${pc.dim("Remediation:")} ${finding.remediation}`);
    lines.push("");
  }

  return lines.join("\n");
}
