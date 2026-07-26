import { describe, it, expect } from "vitest";
import { discoverConfigurationItems } from "../index";
import { VirtualFile } from "../../loader/walker";

describe("discoverConfigurationItems", () => {
  it("discovers configuration items from .env and container files", () => {
    const files: VirtualFile[] = [
      {
        path: ".env",
        relativePath: ".env",
        content: "PORT=3000\nNEXT_PUBLIC_API_URL=https://api.example.com",
        fileType: "ENV"
      },
      {
        path: "docker-compose.yml",
        relativePath: "docker-compose.yml",
        content: "services:\n  app:\n    environment:\n      - DATABASE_URL=postgres://db:5432",
        fileType: "CONTAINER"
      }
    ];

    const frameworks = [
      {
        id: "nextjs",
        name: "Next.js",
        publicPrefixes: ["NEXT_PUBLIC_"],
        implicitEnvFiles: [".env"]
      }
    ];

    const items = discoverConfigurationItems(files, frameworks);

    expect(items).toHaveLength(3);
    const keys = items.map((i) => i.key);
    expect(keys).toContain("PORT");
    expect(keys).toContain("NEXT_PUBLIC_API_URL");
    expect(keys).toContain("DATABASE_URL");

    const nextPublicItem = items.find((i) => i.key === "NEXT_PUBLIC_API_URL");
    expect(nextPublicItem?.inferredFramework).toBe("Next.js");
  });
});
