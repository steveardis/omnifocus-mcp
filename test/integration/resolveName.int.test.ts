import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { runSnippet } from "../../src/runtime/bridge.js";
import { createTestFolder, cleanupTestFolder, type TestFixture } from "./fixtures.js";
import { z } from "zod";
import { ResolveCandidate } from "../../src/schemas/index.js";

/**
 * Integration test: resolve_name
 *
 * Creates two projects with identical names under different folders.
 * Asserts resolve_name returns both candidates with distinct paths,
 * never silently picking one.
 */
describe("resolve_name (integration)", () => {
  let fixture1: TestFixture;
  let fixture2: TestFixture;
  const DUPE_NAME = `DuplicateProject_${Date.now()}`;

  beforeAll(async () => {
    fixture1 = await createTestFolder();
    fixture2 = await createTestFolder();

    const { spawnSync } = await import("child_process");

    for (const folderId of [fixture1.folderId, fixture2.folderId]) {
      const createSnippet = `(() => {
        var folder = flattenedFolders.find(function(f){ return f.id.primaryKey === ${JSON.stringify(folderId)}; });
        if (!folder) throw new Error("Fixture folder not found: " + ${JSON.stringify(folderId)});
        var p = new Project(${JSON.stringify(DUPE_NAME)}, folder);
        return JSON.stringify({ok:true,data:{id:p.id.primaryKey}});
      })()`;
      const script = `
        (function() {
          var app = Application('OmniFocus');
          app.includeStandardAdditions = true;
          try {
            var r = app.evaluateJavascript(${JSON.stringify(createSnippet)});
            $.NSFileHandle.fileHandleWithStandardOutput.writeData($.NSString.alloc.initWithString(r+'\\n').dataUsingEncoding($.NSUTF8StringEncoding));
          } catch(e) {
            $.NSFileHandle.fileHandleWithStandardOutput.writeData($.NSString.alloc.initWithString(JSON.stringify({ok:false,error:{name:e.name,message:e.message}})+'\\n').dataUsingEncoding($.NSUTF8StringEncoding));
          }
        })();
      `;
      const result = spawnSync("osascript", ["-l", "JavaScript"], {
        input: script, encoding: "utf-8", timeout: 15_000,
      });
      const line = (result.stdout || "").split("\n").find((l) => l.trim().startsWith("{"));
      if (!line) throw new Error(`Could not create fixture project in ${folderId}`);
      const parsed = JSON.parse(line) as { ok: boolean; error?: { message: string } };
      if (!parsed.ok) throw new Error(`Create project failed: ${parsed.error?.message}`);
    }
  });

  afterAll(async () => {
    await Promise.all([
      cleanupTestFolder(fixture1.folderId),
      cleanupTestFolder(fixture2.folderId),
    ]);
  });

  it("returns both candidates when duplicate project names exist under different folders", async () => {
    const raw = await runSnippet("resolve_name", {
      type: "project",
      query: DUPE_NAME,
      scope: null,
    });
    const candidates = z.array(ResolveCandidate).parse(raw);
    const mine = candidates.filter((c) => c.name === DUPE_NAME);
    expect(mine.length).toBeGreaterThanOrEqual(2);

    // Each candidate must have a distinct path
    const paths = mine.map((c) => c.path);
    const unique = new Set(paths);
    expect(unique.size).toBe(mine.length);
  });

  it("returns empty array for a name that matches nothing", async () => {
    const raw = await runSnippet("resolve_name", {
      type: "project",
      query: `__nonexistent_${Date.now()}__`,
      scope: null,
    });
    const candidates = z.array(ResolveCandidate).parse(raw);
    expect(candidates).toHaveLength(0);
  });
});
