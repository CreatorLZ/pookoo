import * as fs from "fs";
import * as path from "path";

export type CategorizedFileType = "ENV" | "MANIFEST" | "SOURCE" | "CONTAINER" | "UNKNOWN";

export interface VirtualFile {
  path: string;
  relativePath: string;
  content: string;
  fileType: CategorizedFileType;
}

export interface FileWalkerOptions {
  ignorePatterns?: string[];
}

const DEFAULT_IGNORE = [
  "node_modules",
  ".git",
  ".turbo",
  "dist",
  "build",
  "coverage",
  ".pnpm-store",
  ".next",
  ".nuxt",
  ".svelte-kit",
  ".output",
  "out",
  ".vercel",
  ".netlify",
  ".cache",
  ".parcel-cache",
  "__pycache__",
  ".expo",
  "test",
  "tests",
  "__tests__",
  "fixtures",
  "e2e"
];

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

export function categorizeFile(filePath: string): CategorizedFileType {
  const baseName = path.basename(filePath);
  const ext = path.extname(filePath).toLowerCase();

  if (baseName.startsWith(".env")) {
    return "ENV";
  }

  if (baseName === "package.json" || baseName === "tsconfig.json") {
    return "MANIFEST";
  }

  if (
    baseName === "docker-compose.yml" ||
    baseName === "docker-compose.yaml" ||
    baseName === "Dockerfile"
  ) {
    return "CONTAINER";
  }

  if ([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"].includes(ext)) {
    return "SOURCE";
  }

  return "UNKNOWN";
}

export function walkDirectory(dirPath: string, options: FileWalkerOptions = {}): VirtualFile[] {
  const ignoreList = new Set([...DEFAULT_IGNORE, ...(options.ignorePatterns || [])]);
  const results: VirtualFile[] = [];

  function traverse(currentPath: string) {
    if (!fs.existsSync(currentPath)) return;

    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      if (ignoreList.has(entry.name)) continue;

      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        traverse(fullPath);
      } else if (entry.isFile()) {
        const fileType = categorizeFile(fullPath);
        if (fileType !== "UNKNOWN") {
          try {
            const stat = fs.statSync(fullPath);
            if (stat.size > MAX_FILE_SIZE_BYTES) continue;
            const content = fs.readFileSync(fullPath, "utf-8");
            const relativePath = path.relative(dirPath, fullPath).replace(/\\/g, "/");
            results.push({
              path: fullPath.replace(/\\/g, "/"),
              relativePath,
              content,
              fileType
            });
          } catch {
            // Ignore unreadable binary/permission denied files silently
          }
        }
      }
    }
  }

  traverse(dirPath);
  return results;
}
