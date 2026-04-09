import { randomUUID } from "crypto";
import { runSnippet } from "../../src/runtime/bridge.js";

export interface TestFixture {
  folderId: string;
  folderName: string;
}

/**
 * Creates a top-level OmniFocus folder named __MCP_TEST_<uuid>__.
 * All test fixtures must be created inside this folder.
 * Returns the folder's id.primaryKey.
 */
export async function createTestFolder(): Promise<TestFixture> {
  const name = `__MCP_TEST_${randomUUID()}__`;

  // We need a create-folder snippet for fixtures.
  // Since core CRUD lands in the next change, we inline a minimal creation here.
  const { spawnSync } = await import("child_process");
  const script = `
    (function() {
      try {
        var app = Application('OmniFocus');
        app.includeStandardAdditions = true;
        var snippet = (function() {
          var name = ${JSON.stringify(name)};
          var snip = "(() => { var f = new Folder(" + JSON.stringify(name) + "); return JSON.stringify({ok:true,data:{id:f.id.primaryKey,name:f.name}}); })()";
          return snip;
        })();
        var result = app.evaluateJavascript(snippet);
        $.NSFileHandle.fileHandleWithStandardOutput.writeData(
          $.NSString.alloc.initWithString(result + '\\n').dataUsingEncoding($.NSUTF8StringEncoding)
        );
      } catch(e) {
        $.NSFileHandle.fileHandleWithStandardOutput.writeData(
          $.NSString.alloc.initWithString(JSON.stringify({ok:false,error:{name:e.name||'Error',message:e.message||String(e)}}) + '\\n').dataUsingEncoding($.NSUTF8StringEncoding)
        );
      }
    })();
  `;

  const result = spawnSync("osascript", ["-l", "JavaScript"], {
    input: script,
    encoding: "utf-8",
    timeout: 15_000,
  });

  const stdout = result.stdout || "";
  const line = stdout.split("\n").find((l) => l.trim().startsWith("{"));
  if (!line) throw new Error(`createTestFolder: no JSON in output: ${stdout}`);
  const parsed = JSON.parse(line) as {
    ok: boolean;
    data?: { id: string; name: string };
    error?: { message: string };
  };
  if (!parsed.ok || !parsed.data) {
    throw new Error(`createTestFolder failed: ${parsed.error?.message}`);
  }

  return { folderId: parsed.data.id, folderName: parsed.data.name };
}

/**
 * Removes the test fixture folder (and all contents) by ID.
 */
export async function cleanupTestFolder(folderId: string): Promise<void> {
  const { spawnSync } = await import("child_process");
  // deleteObject(folder) alone leaves the folder shell behind in OmniFocus.
  // Must explicitly delete projects first, child folders recursively, then the folder.
  const snippet = `(() => {
    function deleteFolder(f) {
      f.flattenedProjects.forEach(function(p) { deleteObject(p); });
      f.folders.forEach(function(child) { deleteFolder(child); });
      deleteObject(f);
    }
    var f = flattenedFolders.find(function(f){ return f.id.primaryKey === ${JSON.stringify(folderId)}; });
    if (f) { deleteFolder(f); }
    return JSON.stringify({ok:true,data:null});
  })()`;
  const script = `
    (function() {
      var app = Application('OmniFocus');
      app.includeStandardAdditions = true;
      try {
        var result = app.evaluateJavascript(${JSON.stringify(snippet)});
        $.NSFileHandle.fileHandleWithStandardOutput.writeData(
          $.NSString.alloc.initWithString(result + '\\n').dataUsingEncoding($.NSUTF8StringEncoding)
        );
      } catch(e) {
        $.NSFileHandle.fileHandleWithStandardOutput.writeData(
          $.NSString.alloc.initWithString(JSON.stringify({ok:true,data:null}) + '\\n').dataUsingEncoding($.NSUTF8StringEncoding)
        );
      }
    })();
  `;
  spawnSync("osascript", ["-l", "JavaScript"], {
    input: script,
    encoding: "utf-8",
    timeout: 15_000,
  });
}

/**
 * Helper: creates a fixture folder, runs fn, cleans up in afterAll.
 * Usage: const fixture = await withTestFolder(async (f) => { ... });
 */
export async function withTestFolder<T>(
  fn: (fixture: TestFixture) => Promise<T>
): Promise<T> {
  const fixture = await createTestFolder();
  try {
    return await fn(fixture);
  } finally {
    await cleanupTestFolder(fixture.folderId);
  }
}
