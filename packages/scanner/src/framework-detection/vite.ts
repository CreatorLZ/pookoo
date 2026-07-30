import { VirtualFile } from "../loader/walker";
import { FrameworkMetadata } from "./nextjs";

export function detectVite(files: VirtualFile[]): FrameworkMetadata | null {
  const packageJsonFile = files.find((f) => f.relativePath === "package.json");
  let isVite = false;

  if (packageJsonFile) {
    try {
      const parsed = JSON.parse(packageJsonFile.content);
      const deps = { ...parsed.dependencies, ...parsed.devDependencies };
      if (deps.vite) {
        isVite = true;
      }
    } catch {
      // Ignore parse error
    }
  }

  const viteConfigFile = files.find((f) => f.relativePath.startsWith("vite.config."));
  if (viteConfigFile) {
    isVite = true;
  }

  if (!isVite) return null;

  return {
    id: "vite",
    name: "Vite",
    publicPrefixes: ["VITE_"],
    implicitEnvFiles: [".env", ".env.local", ".env.production"]
  };
}
