import { ScanResult } from "@pookoo/shared";

export function formatMarkdownReport(result: ScanResult): string {
  const lines: string[] = [];

  lines.push("# Pookoo Configuration Report\n");
  lines.push(`- **Scanned Files**: ${result.scannedFilesCount}\n`);

  lines.push("## Diagnostic Findings\n");

  if (result.findings.length === 0) {
    lines.push("> [!NOTE]");
    lines.push(
      "> No configuration issues detected. All variables are documented, referenced, and safe.\n"
    );
    return lines.join("\n");
  }

  lines.push("| Severity | Rule ID | Target Key | Finding Message |");
  lines.push("| :--- | :--- | :--- | :--- |");

  for (const finding of result.findings) {
    lines.push(
      `| **${finding.severity}** | \`${finding.ruleId}\` | \`${finding.targetKey}\` | ${finding.message} |`
    );
  }

  lines.push("\n### Remediation Recommendations\n");

  for (const finding of result.findings) {
    lines.push(`#### \`${finding.targetKey}\` (${finding.ruleId})`);
    lines.push(`- **Explanation**: ${finding.explanation}`);
    lines.push(`- **Remediation**: ${finding.remediation}\n`);
  }

  return lines.join("\n");
}
