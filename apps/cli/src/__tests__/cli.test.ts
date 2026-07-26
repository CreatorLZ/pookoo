import { describe, it, expect } from "vitest";

describe("CLI entry point", () => {
  it("module loads without error", async () => {
    const mod = await import("../index");
    expect(mod).toBeDefined();
  });
});
