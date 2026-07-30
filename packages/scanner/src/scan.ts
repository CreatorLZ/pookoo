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

  if (!options.silent) {
    process.stderr.write(pc.dim("Scanning files...\n"));
  }
  const files = walkDirectory(targetPath, mergedOptions);

  if (!options.silent) {
    process.stderr.write(pc.dim(`Detecting frameworks (${files.length} files)...\n`));
  }
  const frameworks = detectFrameworks(files);

  if (!options.silent) {
    process.stderr.write(pc.dim("Discovering configuration items...\n"));
  }
  const items = discoverConfigurationItems(files, frameworks);

  if (!options.silent) {
    process.stderr.write(pc.dim("Mapping source code usages...\n"));
  }
  const usages = mapRepositoryUsages(files);

  if (!options.silent) {
    process.stderr.write(pc.dim("Building knowledge graph...\n"));
  }
  const extraDeclarations = discoverConfigurationItemFiles(files);
  const knowledgeGraph = buildKnowledgeGraph(items, usages, { extraDeclarations });

  if (!options.silent) {
    process.stderr.write(pc.dim("Evaluating rules...\n"));
  }
  const { findings, healthScore } = evaluateRules(knowledgeGraph);

  const elapsed = Date.now() - startTime;

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
