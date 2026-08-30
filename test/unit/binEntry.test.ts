import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");
const SHEBANG = "#!/usr/bin/env node";

// package.json declares dist/server.js as the `bin` entry, so npx and a global
// install execute it directly rather than through `node`. Without a shebang the
// shell interprets it as a shell script and every import line fails with
// "import: command not found".
describe("bin entry", () => {
  const pkg = JSON.parse(readFileSync(join(repoRoot, "package.json"), "utf-8"));

  it("declares a bin entry pointing at the compiled server", () => {
    expect(pkg.bin["omnifocus-mcp"]).toBe("dist/server.js");
  });

  it("the source of the bin entry starts with a node shebang", () => {
    const source = readFileSync(join(repoRoot, "src/server.ts"), "utf-8");
    expect(source.split("\n")[0]).toBe(SHEBANG);
  });

  it("the compiled bin entry starts with a node shebang", () => {
    const compiled = join(repoRoot, "dist/server.js");
    if (!existsSync(compiled)) {
      throw new Error(`${compiled} not found — run npm run build before this test`);
    }
    expect(readFileSync(compiled, "utf-8").split("\n")[0]).toBe(SHEBANG);
  });
});
