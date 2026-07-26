import { ScanResult } from "@pookoo/shared";
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
    console.error("Scanning files...");
  }
  const files = walkDirectory(targetPath, mergedOptions);

  if (!options.silent) {
    console.error(`Detecting frameworks (${files.length} files)...`);
  }
  const frameworks = detectFrameworks(files);

  if (!options.silent) {
    console.error("Discovering configuration items...");
  }
  const items = discoverConfigurationItems(files, frameworks);

  if (!options.silent) {
    console.error("Mapping source code usages...");
  }
  const usages = mapRepositoryUsages(files);

  if (!options.silent) {
    console.error("Building knowledge graph...");
  }
  const extraDeclarations = discoverConfigurationItemFiles(files);
  const knowledgeGraph = buildKnowledgeGraph(items, usages, { extraDeclarations });

  if (!options.silent) {
    console.error("Evaluating rules...");
  }
  const { findings, healthScore } = evaluateRules(knowledgeGraph);

  const elapsed = Date.now() - startTime;

  if (!options.silent) {
    console.error(`Scan completed in ${elapsed}ms`);
  }

  return {
    knowledgeGraph,
    findings,
    healthScore,
    scannedFilesCount: files.length
  };
}

