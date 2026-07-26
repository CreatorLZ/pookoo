#!/usr/bin/env node

import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";
import { scan, formatTerminalReport, formatMarkdownReport, formatJsonReport } from "@configiq/scanner";

const program = new Command();

program
  .name("configiq")
  .description("ConfigIQ - Intelligent Configuration Reasoning Engine")
  .version("0.1.0");

program
  .command("scan [targetPath]")
  .description("Scan a repository to audit, discover, and reason about its configuration ecosystem")
  .option("-f, --format <type>", "Output format (terminal, markdown, json)", "terminal")
  .option("-o, --output <file>", "Write report to file instead of stdout")
  .option("--fail-on <severity>", "Exit with status 1 if findings equal or exceed severity threshold (INFO, LOW, MEDIUM, HIGH, CRITICAL)")
  .action((targetPathArg?: string, options?: { format: string; output?: string; failOn?: string }) => {
    const targetPath = path.resolve(process.cwd(), targetPathArg || ".");
    const formatType = (options?.format?.toLowerCase() || (options?.output ? "markdown" : "terminal"));

    try {
      const result = scan(targetPath, { silent: formatType === "json" });

      let output: string;
      if (formatType === "json") {
        output = formatJsonReport(result);
      } else if (formatType === "markdown") {
        output = formatMarkdownReport(result);
      } else {
        output = formatTerminalReport(result);
      }

      if (options?.output) {
        fs.writeFileSync(options.output, output, "utf-8");
      } else {
        console.log(output);
      }

      if (options?.failOn) {
        const threshold = options.failOn.toUpperCase();
        const SEVERITY_RANK: Record<string, number> = {
          INFO: 0,
          LOW: 1,
          MEDIUM: 2,
          HIGH: 3,
          CRITICAL: 4
        };
        const minRank = SEVERITY_RANK[threshold] ?? 0;
        const hasFailingFindings = result.findings.some(
          (f) => (SEVERITY_RANK[f.severity] ?? 0) >= minRank
        );
        if (hasFailingFindings) {
          process.exit(1);
        }
      }
    } catch (err) {
      console.error("Error executing scan:", err);
      process.exit(1);
    }
  });

program
  .command("doctor")
  .description("Run self-diagnostic checks on the current environment")
  .action(() => {
    const nodeVersion = process.version;
    const nodeMajor = parseInt(nodeVersion.slice(1).split(".")[0], 10);
    const isNodeOk = nodeMajor >= 18;

    const cwd = process.cwd();
    const hasPackageJson = fs.existsSync(path.join(cwd, "package.json"));
    const hasEnvExample = fs.existsSync(path.join(cwd, ".env.example"));
    const hasEnv = fs.existsSync(path.join(cwd, ".env"));

    const separator = "─".repeat(50);
    console.log(`\n${separator}`);
    console.log("  ConfigIQ Environment Diagnostics");
    console.log(`${separator}\n`);

    console.log(`  ${isNodeOk ? "✓" : "✗"} Node.js    : ${nodeVersion} ${isNodeOk ? "(OK)" : "(requires >= 18)"}`);
    console.log(`  ${hasPackageJson ? "✓" : "✗"} package.json in ${cwd}`);
    console.log(`  ${hasEnvExample ? "✓" : "○"} .env.example ${hasEnvExample ? "" : "(not found — recommended)"}`);
    console.log(`  ${hasEnv ? "✓" : "○"} .env file ${hasEnv ? "" : "(not found — expected for most projects)"}`);

    console.log(`\n${separator}\n`);
  });

if (require.main === module) {
  program.parse(process.argv);
}
