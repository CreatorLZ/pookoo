#!/usr/bin/env node

import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";
import {
  scan,
  formatTerminalReport,
  formatMarkdownReport,
  formatJsonReport,
  generateEnvExample,
  generateConfigDocs
} from "@pookoo/scanner";

/**
 * Resolve the output file path.
 * - No -o flag: defaults to <targetPath>/<defaultName>
 * - Absolute -o: used as-is
 * - Relative -o: resolved from targetPath
 */
function resolveOutputPath(
  targetPath: string,
  outputOption: string | undefined,
  defaultName: string
): string {
  if (!outputOption) {
    return path.join(targetPath, defaultName);
  }
  if (path.isAbsolute(outputOption)) {
    return outputOption;
  }
  return path.resolve(targetPath, outputOption);
}

const program = new Command();

const pkgPath = path.join(__dirname, "../package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
const CLI_VERSION = pkg.version as string;

program
  .name("pookoo")
  .description("Pookoo - Intelligent Configuration Reasoning Engine")
  .version(CLI_VERSION);

program
  .command("scan [targetPath]")
  .description("Scan a repository to audit, discover, and reason about its configuration ecosystem")
  .option("-f, --format <type>", "Output format (terminal, markdown, json)", "terminal")
  .option("-o, --output <file>", "Write report to file instead of stdout")
  .option(
    "--fail-on <severity>",
    "Exit with status 1 if findings equal or exceed severity threshold (INFO, LOW, MEDIUM, HIGH, CRITICAL)"
  )
  .action(
    (targetPathArg?: string, options?: { format: string; output?: string; failOn?: string }) => {
      const targetPath = path.resolve(process.cwd(), targetPathArg || ".");
      const formatType =
        options?.format?.toLowerCase() || (options?.output ? "markdown" : "terminal");

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
          // INFO findings are informational-only and never trigger --fail-on
          const enforceable = result.findings.filter((f) => f.severity !== "INFO");
          const hasFailingFindings = enforceable.some(
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
    }
  );

program
  .command("init [targetPath]")
  .description("Generate a .env.example file from discovered configuration variables")
  .option("--no-comments", "Omit descriptive comments")
  .option("--no-sources", "Omit source file usage hints")
  .option("--examples", "Include placeholder example values")
  .option("--no-groups", "Don't group variables by category")
  .option("-o, --output <file>", "Output file path (relative to target, or absolute)")
  .option("--force", "Overwrite existing output file")
  .action(
    (
      targetPathArg?: string,
      options?: {
        comments: boolean;
        sources: boolean;
        examples: boolean;
        groups: boolean;
        output?: string;
        force?: boolean;
      }
    ) => {
      const targetPath = path.resolve(process.cwd(), targetPathArg || ".");

      try {
        const outputPath = resolveOutputPath(targetPath, options?.output, ".env.example");

        if (fs.existsSync(outputPath) && !options?.force) {
          console.error(`\n  ✗ File already exists: ${outputPath}`);
          console.error(`    Use --force to overwrite.\n`);
          process.exit(1);
        }

        console.error("Scanning project...");
        const result = scan(targetPath, { silent: true });

        const envContent = generateEnvExample(result, {
          includeDescriptions: options?.comments !== false,
          includeSourceHints: options?.sources !== false,
          includeExampleValues: options?.examples === true,
          groupByCategory: options?.groups !== false
        });

        fs.writeFileSync(outputPath, envContent, "utf-8");

        // Count stats for summary
        const lineCount = envContent.split("\n").filter((l) => l.match(/^[A-Z0-9_]+=/)).length;
        const publicCount = envContent
          .split("\n")
          .filter((l) => l.match(/^(NEXT_PUBLIC_|VITE_|REACT_APP_)/)).length;
        const serverCount = lineCount - publicCount;

        console.log(
          `\n  ✓ Generated ${path.basename(outputPath)} with ${lineCount} variables (${publicCount} public, ${serverCount} server)`
        );
        console.log(`    Written to: ${outputPath}\n`);
      } catch (err) {
        if ((err as NodeJS.ErrnoException).code === "EEXIST_POOKOO") return;
        console.error("Error generating .env.example:", err);
        process.exit(1);
      }
    }
  );

program
  .command("docs [targetPath]")
  .description("Generate configuration reference documentation")
  .option("-o, --output <file>", "Output file path (relative to target, or absolute)")
  .option("--title <title>", "Document title", "Configuration Reference")
  .option("--no-summary", "Omit the overview summary section")
  .option("--force", "Overwrite existing output file")
  .action(
    (
      targetPathArg?: string,
      options?: {
        output?: string;
        title: string;
        summary: boolean;
        force?: boolean;
      }
    ) => {
      const targetPath = path.resolve(process.cwd(), targetPathArg || ".");

      try {
        const outputPath = resolveOutputPath(targetPath, options?.output, "CONFIG_DOCS.md");

        if (fs.existsSync(outputPath) && !options?.force) {
          console.error(`\n  ✗ File already exists: ${outputPath}`);
          console.error(`    Use --force to overwrite.\n`);
          process.exit(1);
        }

        console.error("Scanning project...");
        const result = scan(targetPath, { silent: true });

        const docsResult = generateConfigDocs(result, {
          title: options?.title || "Configuration Reference",
          includeSummary: options?.summary !== false,
          cliVersion: CLI_VERSION
        });

        fs.writeFileSync(outputPath, docsResult.content, "utf-8");

        console.log(`\n  ✓ Generated configuration documentation`);
        console.log(`    ${docsResult.count} variables documented`);
        console.log(`    Written to: ${outputPath}\n`);
      } catch (err) {
        console.error("Error generating documentation:", err);
        process.exit(1);
      }
    }
  );

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
    console.log("  Pookoo Environment Diagnostics");
    console.log(`${separator}\n`);

    console.log(
      `  ${isNodeOk ? "✓" : "✗"} Node.js    : ${nodeVersion} ${isNodeOk ? "(OK)" : "(requires >= 18)"}`
    );
    console.log(`  ${hasPackageJson ? "✓" : "✗"} package.json in ${cwd}`);
    console.log(
      `  ${hasEnvExample ? "✓" : "○"} .env.example ${hasEnvExample ? "" : "(not found — run 'pookoo init' to generate)"}`
    );
    console.log(
      `  ${hasEnv ? "✓" : "○"} .env file ${hasEnv ? "" : "(not found — expected for most projects)"}`
    );

    console.log(`\n${separator}\n`);
  });

if (require.main === module) {
  program.parse(process.argv);
}
