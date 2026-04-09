import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { runSnippet } from "../../src/runtime/bridge.js";
import { createTestFolder, cleanupTestFolder, type TestFixture } from "./fixtures.js";
import { TaskDetail } from "../../src/schemas/index.js";

/**
 * Integration test: get_task
 *
 * Creates a task with apostrophes and unicode in its name, retrieves by ID,
 * asserts the name survives the round-trip. Proves Decision 2 end-to-end.
 */
describe("get_task (integration)", () => {
  let fixture: TestFixture;
  let taskId: string;
  const taskName = "Finn's \"birthday\" — ▸ 🎉";
  const taskNote = "Note with apostrophe's and line1\nline2";

  beforeAll(async () => {
    fixture = await createTestFolder();

    // Create a project then a task inside it
    const { spawnSync } = await import("child_process");
    const createSnippet = `(() => {
      var folder = flattenedFolders.find(function(f){ return f.id.primaryKey === ${JSON.stringify(fixture.folderId)}; });
      if (!folder) throw new Error("Fixture folder not found");
      var proj = new Project("TestProject", folder);
      var task = new Task(${JSON.stringify(taskName)}, proj);
      task.note = ${JSON.stringify(taskNote)};
      return JSON.stringify({ok:true,data:{id:task.id.primaryKey}});
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
    if (!line) throw new Error(`Could not create fixture task: ${result.stdout}`);
    const parsed = JSON.parse(line) as { ok: boolean; data?: { id: string }; error?: { message: string } };
    if (!parsed.ok || !parsed.data) throw new Error(`Create task failed: ${parsed.error?.message}`);
    taskId = parsed.data.id;
  });

  afterAll(async () => {
    await cleanupTestFolder(fixture.folderId);
  });

  it("retrieves task by ID with name and note intact (proves apostrophe/unicode safety)", async () => {
    const raw = await runSnippet("get_task", { id: taskId });
    const task = TaskDetail.parse(raw);
    expect(task.id).toBe(taskId);
    expect(task.name).toBe(taskName);
    expect(task.note).toBe(taskNote);
  });
});
