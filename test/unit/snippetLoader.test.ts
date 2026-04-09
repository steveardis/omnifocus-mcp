import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { writeFileSync, mkdirSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

// We test the loader logic directly by pointing it at temp fixture files.
// The real loader uses __dirname-relative paths; we test the core validation
// logic by importing the internals.

describe("snippet __ARGS__ validation", () => {
  // Test the validation logic inline (mirrors snippetLoader.ts exactly)
  function validate(content: string, name: string): void {
    const matches = content.split("__ARGS__").length - 1;
    if (matches === 0) {
      throw new Error(`Snippet "${name}" contains no __ARGS__ placeholder.`);
    }
    if (matches > 1) {
      throw new Error(
        `Snippet "${name}" contains ${matches} __ARGS__ placeholders. Exactly one is required.`
      );
    }
  }

  it("accepts snippet with exactly one __ARGS__", () => {
    expect(() =>
      validate("const args = __ARGS__; return args;", "valid")
    ).not.toThrow();
  });

  it("rejects snippet with zero __ARGS__", () => {
    expect(() =>
      validate("const x = 1; return x;", "no-placeholder")
    ).toThrow(/no __ARGS__ placeholder/);
  });

  it("rejects snippet with two __ARGS__", () => {
    expect(() =>
      validate("const a = __ARGS__; const b = __ARGS__;", "two-placeholders")
    ).toThrow(/2 __ARGS__ placeholders/);
  });

  it("all real snippets contain exactly one __ARGS__", async () => {
    const { readdirSync, readFileSync } = await import("fs");
    const { join: pathJoin } = await import("path");
    const { fileURLToPath } = await import("url");
    const { dirname } = await import("path");
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const snippetsDir = pathJoin(__dirname, "../../src/snippets");
    const files = readdirSync(snippetsDir).filter((f) => f.endsWith(".js"));
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      const content = readFileSync(pathJoin(snippetsDir, file), "utf-8");
      expect(() => validate(content, file), `${file}`).not.toThrow();
    }
  });
});
