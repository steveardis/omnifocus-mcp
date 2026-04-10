import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { spawnSync } from "child_process";
import { runSnippet } from "../../src/runtime/bridge.js";
import { createTestFolder, cleanupTestFolder, type TestFixture } from "./fixtures.js";
import { FolderSummary } from "../../src/schemas/index.js";
import { z } from "zod";

const FolderSummaryArray = z.array(FolderSummary);

/**
 * Creates a folder and immediately drops it (active = false).
 * Returns the folder id.
 */
async function createDroppedFolder(name: string): Promise<string> {
  const snippet = `(() => {
    var f = new Folder(${JSON.stringify(name)});
    f.active = false;
    return JSON.stringify({ok:true,data:{id:f.id.primaryKey}});
  })()`;
  const script = `(function(){
    var app = Application('OmniFocus');
    app.includeStandardAdditions = true;
    try {
      var r = app.evaluateJavascript(${JSON.stringify(snippet)});
      $.NSFileHandle.fileHandleWithStandardOutput.writeData($.NSString.alloc.initWithString(r+'\\n').dataUsingEncoding($.NSUTF8StringEncoding));
    } catch(e) {
      $.NSFileHandle.fileHandleWithStandardOutput.writeData($.NSString.alloc.initWithString(JSON.stringify({ok:false,error:{message:String(e)}})+'\\n').dataUsingEncoding($.NSUTF8StringEncoding));
    }
  })();`;
  const result = spawnSync("osascript", ["-l", "JavaScript"], { input: script, encoding: "utf-8", timeout: 15_000 });
  const line = (result.stdout || "").split("\n").find((l) => l.trim().startsWith("{"));
  if (!line) throw new Error(`createDroppedFolder: no JSON in output: ${result.stdout}`);
  const parsed = JSON.parse(line) as { ok: boolean; data?: { id: string }; error?: { message: string } };
  if (!parsed.ok || !parsed.data) throw new Error(`createDroppedFolder failed: ${parsed.error?.message}`);
  return parsed.data.id;
}

async function deleteFolder(folderId: string): Promise<void> {
  const snippet = `(() => {
    var f = flattenedFolders.find(function(f){ return f.id.primaryKey === ${JSON.stringify(folderId)}; });
    if (f) deleteObject(f);
    return JSON.stringify({ok:true,data:null});
  })()`;
  const script = `(function(){
    var app = Application('OmniFocus');
    app.includeStandardAdditions = true;
    try {
      var r = app.evaluateJavascript(${JSON.stringify(snippet)});
      $.NSFileHandle.fileHandleWithStandardOutput.writeData($.NSString.alloc.initWithString(r+'\\n').dataUsingEncoding($.NSUTF8StringEncoding));
    } catch(_) {}
  })();`;
  spawnSync("osascript", ["-l", "JavaScript"], { input: script, encoding: "utf-8", timeout: 15_000 });
}

describe("list_folders filtering (integration)", () => {
  let activeFixture: TestFixture;
  let droppedFolderId: string;

  beforeAll(async () => {
    activeFixture = await createTestFolder();
    droppedFolderId = await createDroppedFolder(`__MCP_DROPPED_FOLDER_TEST__`);
  });

  afterAll(async () => {
    await cleanupTestFolder(activeFixture.folderId);
    await deleteFolder(droppedFolderId);
  });

  it("no filter returns all folders including dropped", async () => {
    const raw = await runSnippet("list_folders", {});
    const folders = FolderSummaryArray.parse(raw);
    const ids = folders.map((f) => f.id);
    expect(ids).toContain(activeFixture.folderId);
    expect(ids).toContain(droppedFolderId);
  });

  it("status filter 'active' returns only active folders", async () => {
    const raw = await runSnippet("list_folders", { filter: { status: "active" } });
    const folders = FolderSummaryArray.parse(raw);
    expect(folders.every((f) => f.status === "active")).toBe(true);
    expect(folders.some((f) => f.id === activeFixture.folderId)).toBe(true);
    expect(folders.some((f) => f.id === droppedFolderId)).toBe(false);
  });

  it("status filter 'dropped' returns only dropped folders", async () => {
    const raw = await runSnippet("list_folders", { filter: { status: "dropped" } });
    const folders = FolderSummaryArray.parse(raw);
    expect(folders.every((f) => f.status === "dropped")).toBe(true);
    expect(folders.some((f) => f.id === droppedFolderId)).toBe(true);
    expect(folders.some((f) => f.id === activeFixture.folderId)).toBe(false);
  });

  it("limit caps the number of returned folders", async () => {
    const raw = await runSnippet("list_folders", { limit: 1 });
    const folders = FolderSummaryArray.parse(raw);
    expect(folders.length).toBeLessThanOrEqual(1);
  });
});
