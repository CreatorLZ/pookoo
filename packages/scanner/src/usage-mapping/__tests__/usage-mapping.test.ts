import { describe, it, expect } from "vitest";
import { mapRepositoryUsages } from "../index";
import { VirtualFile } from "../../loader/walker";

describe("mapRepositoryUsages", () => {
  it("aggregates call-sites across multiple source files", () => {
    const files: VirtualFile[] = [
      {
        path: "src/server.ts",
        relativePath: "src/server.ts",
        content: "const port = process.env.PORT || 3000;",
        fileType: "SOURCE"
      },
      {
        path: "src/client.ts",
        relativePath: "src/client.ts",
        content: "const key = import.meta.env.VITE_KEY;",
        fileType: "SOURCE"
      }
    ];

    const usages = mapRepositoryUsages(files);
    expect(usages).toHaveLength(2);
    expect(usages[0].itemKey).toBe("PORT");
    expect(usages[1].itemKey).toBe("VITE_KEY");
  });
});
