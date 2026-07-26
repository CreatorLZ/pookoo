import { describe, it, expect } from "vitest";
import { detectFrameworks } from "../index";
import { VirtualFile } from "../../loader/walker";

describe("detectFrameworks", () => {
  it("detects Next.js from package.json dependencies", () => {
    const files: VirtualFile[] = [
      {
        path: "package.json",
        relativePath: "package.json",
        content: JSON.stringify({ dependencies: { next: "^14.0.0" } }),
        fileType: "MANIFEST"
      }
    ];

    const frameworks = detectFrameworks(files);
    expect(frameworks).toHaveLength(1);
    expect(frameworks[0].id).toBe("nextjs");
    expect(frameworks[0].publicPrefixes).toContain("NEXT_PUBLIC_");
  });

  it("detects Vite from vite.config.ts file presence", () => {
    const files: VirtualFile[] = [
      {
        path: "vite.config.ts",
        relativePath: "vite.config.ts",
        content: "export default {}",
        fileType: "SOURCE"
      }
    ];

    const frameworks = detectFrameworks(files);
    expect(frameworks).toHaveLength(1);
    expect(frameworks[0].id).toBe("vite");
    expect(frameworks[0].publicPrefixes).toContain("VITE_");
  });
});
