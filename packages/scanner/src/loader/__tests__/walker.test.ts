import { describe, it, expect } from "vitest";
import { categorizeFile } from "../walker";

describe("categorizeFile", () => {
  it("categorizes .env variants as ENV", () => {
    expect(categorizeFile(".env")).toBe("ENV");
    expect(categorizeFile(".env.local")).toBe("ENV");
    expect(categorizeFile(".env.production")).toBe("ENV");
  });

  it("categorizes manifest files", () => {
    expect(categorizeFile("package.json")).toBe("MANIFEST");
    expect(categorizeFile("tsconfig.json")).toBe("MANIFEST");
  });

  it("categorizes source code files", () => {
    expect(categorizeFile("src/index.ts")).toBe("SOURCE");
    expect(categorizeFile("src/App.tsx")).toBe("SOURCE");
    expect(categorizeFile("lib/utils.js")).toBe("SOURCE");
  });

  it("categorizes container files", () => {
    expect(categorizeFile("docker-compose.yml")).toBe("CONTAINER");
    expect(categorizeFile("Dockerfile")).toBe("CONTAINER");
  });

  it("returns UNKNOWN for unsupported file types", () => {
    expect(categorizeFile("image.png")).toBe("UNKNOWN");
    expect(categorizeFile("binary.exe")).toBe("UNKNOWN");
  });
});
