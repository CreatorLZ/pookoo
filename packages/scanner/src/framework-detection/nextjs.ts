import { VirtualFile } from "../loader/walker";

export interface FrameworkMetadata {
  id: string;
  name: string;
  publicPrefixes: string[];
  implicitEnvFiles: string[];
}

export function detectNextJs(files: VirtualFile[]): FrameworkMetadata | null {
  const packageJsonFile = files.find((f) => f.relativePath === "package.json");
  let isNext = false;

  if (packageJsonFile) {
    try {
      const parsed = JSON.parse(packageJsonFile.content);
      const deps = { ...parsed.dependencies, ...parsed.devDependencies };
      if (deps.next) {
        isNext = true;
      }
    } catch {
      // Ignore JSON parse errors
    }
  }

  const nextConfigFile = files.find((f) => f.relativePath.startsWith("next.config."));
  if (nextConfigFile) {
    isNext = true;
  }

  if (!isNext) return null;

  return {
    id: "nextjs",
    name: "Next.js",
    publicPrefixes: ["NEXT_PUBLIC_"],
    implicitEnvFiles: [".env", ".env.local", ".env.development", ".env.production"]
  };
}
