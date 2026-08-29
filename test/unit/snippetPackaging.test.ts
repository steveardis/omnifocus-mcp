import { describe, it, expect, afterEach } from "vitest";
import { mkdtempSync, rmSync, readdirSync, readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { tmpdir } from "os";
import { fileURLToPath } from "url";
import { copySnippets } from "../../scripts/copy-snippets.js";
import { ALLOWED_SNIPPETS } from "../../src/runtime/snippetLoader.js";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");
const sourceDir = join(repoRoot, "src/snippets");

const tempDirs: string[] = [];

function makeTempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "snippet-packaging-"));
  tempDirs.push(dir);
  return dir;
}

afterEach(() => {
  while (tempDirs.length > 0) {
    rmSync(tempDirs.pop()!, { recursive: true, force: true });
  }
});

describe("snippet packaging", () => {
  it("every allowed snippet has a source file", () => {
    for (const name of ALLOWED_SNIPPETS) {
      expect(existsSync(join(sourceDir, `${name}.js`)), name).toBe(true);
    }
  });

  it("every source file is in the allowlist", () => {
    const files = readdirSync(sourceDir).filter((f) => f.endsWith(".js"));
    for (const file of files) {
      expect(ALLOWED_SNIPPETS.has(file.replace(/\.js$/, "")), file).toBe(true);
    }
  });

  it("copies a file for every allowed snippet into the destination", () => {
    const dest = join(makeTempDir(), "snippets");

    const copied = copySnippets(sourceDir, dest);

    expect(copied.length).toBe(ALLOWED_SNIPPETS.size);
    for (const name of ALLOWED_SNIPPETS) {
      expect(existsSync(join(dest, `${name}.js`)), name).toBe(true);
    }
  });

  it("copies snippet contents verbatim", () => {
    const dest = join(makeTempDir(), "snippets");

    copySnippets(sourceDir, dest);

    for (const name of ALLOWED_SNIPPETS) {
      expect(readFileSync(join(dest, `${name}.js`), "utf-8"), name).toBe(
        readFileSync(join(sourceDir, `${name}.js`), "utf-8")
      );
    }
  });

  it("creates the destination directory when it does not exist", () => {
    const dest = join(makeTempDir(), "deeply", "nested", "snippets");

    copySnippets(sourceDir, dest);

    expect(existsSync(dest)).toBe(true);
  });

  it("throws when an allowed snippet is missing from the source directory", () => {
    const emptySource = makeTempDir();
    const dest = join(makeTempDir(), "snippets");

    expect(() => copySnippets(emptySource, dest)).toThrow(/missing/i);
  });
});
