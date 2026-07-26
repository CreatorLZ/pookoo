import { VirtualFile } from "../loader/walker";
import { FrameworkMetadata, detectNextJs } from "./nextjs";
import { detectVite } from "./vite";

export * from "./nextjs";
export * from "./vite";

export function detectFrameworks(files: VirtualFile[]): FrameworkMetadata[] {
  const detected: FrameworkMetadata[] = [];

  const next = detectNextJs(files);
  if (next) detected.push(next);

  const vite = detectVite(files);
  if (vite) detected.push(vite);

  return detected;
}
