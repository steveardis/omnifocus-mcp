import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { runSnippet } from "../../src/runtime/bridge.js";
import { createTestFolder, cleanupTestFolder, type TestFixture } from "./fixtures.js";
import { z } from "zod";
import { ProjectSummary } from "../../src/schemas/index.js";

/**
 * Integration test: list_projects
 *
 * Creates a fixture folder with a child project, calls the real bridge,
 * asserts the fixture project appears with the correct folder path.
 */
describe("list_projects (integration)", () => {
  let fixture: TestFixture;
  let projectId: string;
  const projectName = `TestProject_${Date.now()}`;

  beforeAll(async () => {
    fixture = await createTestFolder();

    // Create a project inside the fixture folder via inline snippet
    const { spawnSync } = await import("child_process");
    const folderName = fixture.folderName;
    const createSnippet = `(() => {
      var folder = flattenedFolders.find(function(f){ return f.id.primaryKey === ${JSON.stringify(fixture.folderId)}; });
      if (!folder) throw new Error("Fixture folder not found");
      var p = new Project(${JSON.stringify(projectName)}, folder);
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
    if (!line) throw new Error(`Could not create fixture project: ${result.stdout}`);
    const parsed = JSON.parse(line) as { ok: boolean; data?: { id: string }; error?: { message: string } };
    if (!parsed.ok || !parsed.data) throw new Error(`Create project failed: ${parsed.error?.message}`);
    projectId = parsed.data.id;
  });

  afterAll(async () => {
    await cleanupTestFolder(fixture.folderId);
  });

  it("returns the fixture project with correct folder path", async () => {
    const raw = await runSnippet("list_projects", {});
    const projects = z.array(ProjectSummary).parse(raw);
    const found = projects.find((p) => p.id === projectId);
    expect(found).toBeDefined();
    expect(found!.name).toBe(projectName);
    expect(found!.folderPath).toBe(fixture.folderName);
  });

  it("returns id.primaryKey for every project", async () => {
    const raw = await runSnippet("list_projects", {});
    const projects = z.array(ProjectSummary).parse(raw);
    for (const p of projects) {
      expect(p.id).toBeTruthy();
      expect(typeof p.id).toBe("string");
    }
  });
});
