import { ConfigurationItem } from "@configiq/shared";

export interface ParseJsonOptions {
  filePath: string;
}

/**
 * Extracts known configuration keys from well-known JSON manifest files.
 * Handles package.json and tsconfig.json patterns.
 */
export function parseJsonManifest(content: string, options: ParseJsonOptions): ConfigurationItem[] {
  const items: ConfigurationItem[] = [];
  const lines = content.split(/\r?\n/);

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(content);
  } catch {
    return items;
  }

  function findLine(key: string, afterLine: number = 0): number {
    for (let i = afterLine; i < lines.length; i++) {
      if (lines[i].includes(`"${key}"`)) {
        return i + 1;
      }
    }
    return 1;
  }

  // package.json: look for "config" field
  if (options.filePath.endsWith("package.json")) {
    const configBlock = parsed.config as Record<string, unknown> | undefined;
    if (configBlock && typeof configBlock === "object") {
      const configLine = findLine("config");
      for (const [key, val] of Object.entries(configBlock)) {
        const lineNum = findLine(key, configLine > 1 ? configLine - 1 : 0);
        items.push({
          key,
          sourceLocation: { filePath: options.filePath, lineNumber: lineNum, columnRange: [1, 1] },
          defaultValue: val !== null && val !== undefined ? String(val) : undefined,
          isRequired: false
        });
      }
    }
  }

  return items;
}
