import * as yaml from "js-yaml";
import { ConfigurationItem } from "@pookoo/shared";

export interface ParseYamlOptions {
  filePath: string;
}

function stripOuterQuotes(value: string): string {
  if ((value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  return value;
}

function findLineNumber(lines: string[], partialKey: string, startLine: number): number {
  for (let i = startLine; i < lines.length; i++) {
    if (lines[i].includes(partialKey)) {
      return i + 1;
    }
  }
  return startLine + 1;
}

export function parseYamlEnvironment(content: string, options: ParseYamlOptions): ConfigurationItem[] {
  const items: ConfigurationItem[] = [];
  const lines = content.split(/\r?\n/);

  let doc: unknown;
  try {
    doc = yaml.load(content);
  } catch {
    return items;
  }

  if (typeof doc !== "object" || doc === null) return items;

  const root = doc as Record<string, unknown>;

  // Handle docker-compose structure: services.<name>.environment
  const services = root.services;
  if (typeof services !== "object" || services === null) return items;

  for (const serviceDef of Object.values(services as Record<string, unknown>)) {
    if (typeof serviceDef !== "object" || serviceDef === null) continue;

    const envBlock = (serviceDef as Record<string, unknown>).environment;
    if (envBlock === null || envBlock === undefined) continue;

    // Search for 'environment:' line to anchor position tracking
    let envBlockLine = -1;
    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim();
      if (trimmed.startsWith("environment:") && !trimmed.startsWith("environment_")) {
        const rest = trimmed.substring("environment:".length).trim();
        // Line style 'environment:' (no inline mapping) or inline 'environment: VAR=value'
        if (rest === "" || rest.startsWith("-") || rest.includes(":")) {
          envBlockLine = i;
          break;
        }
      }
    }

    // Handle array style: environment: [- VAR=value, - VAR2]
    if (Array.isArray(envBlock)) {
      for (const entry of envBlock) {
        if (typeof entry === "string") {
          const eqIndex = entry.indexOf("=");
          if (eqIndex !== -1) {
            const key = entry.substring(0, eqIndex);
            const val = stripOuterQuotes(entry.substring(eqIndex + 1));
            const lineNum = envBlockLine >= 0
              ? findLineNumber(lines, key, envBlockLine)
              : 1;
            items.push({
              key,
              sourceLocation: { filePath: options.filePath, lineNumber: lineNum, columnRange: [1, 1] },
              defaultValue: val || undefined,
              isRequired: !val
            });
          } else {
            const lineNum = envBlockLine >= 0
              ? findLineNumber(lines, entry, envBlockLine)
              : 1;
            items.push({
              key: entry,
              sourceLocation: { filePath: options.filePath, lineNumber: lineNum, columnRange: [1, 1] },
              isRequired: true
            });
          }
        }
      }
    }

    // Handle mapping style: environment: { VAR: value, VAR2: }
    if (typeof envBlock === "object" && !Array.isArray(envBlock)) {
      const envMap = envBlock as Record<string, unknown>;
      for (const [key, val] of Object.entries(envMap)) {
        const lineNum = envBlockLine >= 0
          ? findLineNumber(lines, key, envBlockLine)
          : 1;
        items.push({
          key,
          sourceLocation: { filePath: options.filePath, lineNumber: lineNum, columnRange: [1, 1] },
          defaultValue: val !== null && val !== undefined ? String(val) : undefined,
          isRequired: val === null || val === undefined
        });
      }
    }
  }

  return items;
}

