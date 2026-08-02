import { ScanResult } from "@pookoo/shared";
import pc from "picocolors";
import { walkDirectory, FileWalkerOptions } from "./loader/walker";
import { detectFrameworks } from "./framework-detection";
import { discoverConfigurationItems, discoverConfigurationItemFiles } from "./variable-discovery";
import { mapRepositoryUsages } from "./usage-mapping";
import { buildKnowledgeGraph } from "./knowledge";
import { evaluateRules } from "./rules";
import { loadConfig } from "./config";

export interface ScanOptions extends FileWalkerOptions {
  targetPath: string;
  silent?: boolean;
}

export function scan(targetPath: string, options: Partial<ScanOptions> = {}): ScanResult {
  const startTime = Date.now();
  const config = loadConfig(targetPath);

  const mergedOptions = {
    ...options,
    ignorePatterns: [...(options.ignorePatterns || []), ...(config.ignorePatterns || [])]
  };

  let currentLog = "";
  const logProgress = (msg: string) => {
    if (options.silent) return;
    if (!process.stderr.isTTY) {
      if (msg) process.stderr.write(msg + "\n");
      return;
    }
    if (currentLog) {
      process.stderr.write("\r\x1b[K"); // Clear the current line
    }
    currentLog = msg;
    if (msg) {
      process.stderr.write(pc.dim(msg));
    }
  };

  logProgress("Scanning files...");
  const files = walkDirectory(targetPath, mergedOptions);

  logProgress(`Detecting frameworks (${files.length} files)...`);
  const frameworks = detectFrameworks(files);

  logProgress("Discovering configuration items...");
  const items = discoverConfigurationItems(files, frameworks);

  logProgress("Mapping source code usages...");
  const usages = mapRepositoryUsages(files);

  logProgress("Building knowledge graph...");
  const extraDeclarations = discoverConfigurationItemFiles(files);
  const knowledgeGraph = buildKnowledgeGraph(items, usages, { extraDeclarations });

  logProgress("Evaluating rules...");
  const { findings, healthScore } = evaluateRules(knowledgeGraph, undefined, {
    allowlist: config.allowlist,
    severityOverrides: config.severityOverrides
  });

  const elapsed = Date.now() - startTime;

  logProgress(""); // Clear the final progress message

  if (!options.silent) {
    process.stderr.write(pc.dim(`Scan completed in ${elapsed}ms\n\n`));
  }

  return {
    knowledgeGraph,
    findings,
    healthScore,
    scannedFilesCount: files.length
  };
}
