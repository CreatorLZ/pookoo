import * as fs from "fs";
import * as path from "path";

export interface ConfigIqConfig {
  ignorePatterns?: string[];
  allowlist?: string[];
  severityOverrides?: Record<string, string>;
}

const CONFIG_FILES = [".pookoorc", ".pookoorc.json", "pookoo.json"];

export function loadConfig(targetPath: string): ConfigIqConfig {
  for (const configFile of CONFIG_FILES) {
    const fullPath = path.join(targetPath, configFile);
    if (fs.existsSync(fullPath)) {
      try {
        const content = fs.readFileSync(fullPath, "utf-8");
        return JSON.parse(content) as ConfigIqConfig;
      } catch {
        return {};
      }
    }
  }
  return {};
}
