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
 * Creates a project inside a fixture folder. Returns the project's id.primaryKey.
 * Uses inline JXA so it does not depend on the create_project snippet.
 */
export async function createTestProject(
  folderId: string,
  name: string
): Promise<string> {
  const { spawnSync } = await import("child_process");
  const snippet = `(() => {
    var folder = flattenedFolders.find(function(f){ return f.id.primaryKey === ${JSON.stringify(folderId)}; });
    if (!folder) throw new Error("Fixture folder not found: " + ${JSON.stringify(folderId)});
    var proj = new Project(${JSON.stringify(name)}, folder);
    return JSON.stringify({ok:true,data:{id:proj.id.primaryKey}});
  })()`;
  const script = `
    (function() {
      var app = Application('OmniFocus');
      app.includeStandardAdditions = true;
      try {
        var r = app.evaluateJavascript(${JSON.stringify(snippet)});
        $.NSFileHandle.fileHandleWithStandardOutput.writeData($.NSString.alloc.initWithString(r+'\\n').dataUsingEncoding($.NSUTF8StringEncoding));
      } catch(e) {
        $.NSFileHandle.fileHandleWithStandardOutput.writeData($.NSString.alloc.initWithString(JSON.stringify({ok:false,error:{name:e.name||'Error',message:e.message||String(e)}})+'\\n').dataUsingEncoding($.NSUTF8StringEncoding));
      }
    })();
  `;
  const result = spawnSync("osascript", ["-l", "JavaScript"], {
    input: script,
    encoding: "utf-8",
    timeout: 15_000,
  });
  const line = (result.stdout || "").split("\n").find((l) => l.trim().startsWith("{"));
  if (!line) throw new Error(`createTestProject: no JSON in output: ${result.stdout}`);
  const parsed = JSON.parse(line) as { ok: boolean; data?: { id: string }; error?: { message: string } };
  if (!parsed.ok || !parsed.data) throw new Error(`createTestProject failed: ${parsed.error?.message}`);
  return parsed.data.id;
}

/**
 * Creates a top-level tag. Returns the tag's id.primaryKey.
 * Uses inline JXA so it does not depend on the create_tag snippet.
 */
export async function createTestTag(name: string): Promise<string> {
  const { spawnSync } = await import("child_process");
  const snippet = `(() => {
    var tag = new Tag(${JSON.stringify(name)});
    return JSON.stringify({ok:true,data:{id:tag.id.primaryKey}});
  })()`;
  const script = `
    (function() {
      var app = Application('OmniFocus');
      app.includeStandardAdditions = true;
      try {
        var r = app.evaluateJavascript(${JSON.stringify(snippet)});
        $.NSFileHandle.fileHandleWithStandardOutput.writeData($.NSString.alloc.initWithString(r+'\\n').dataUsingEncoding($.NSUTF8StringEncoding));
      } catch(e) {
        $.NSFileHandle.fileHandleWithStandardOutput.writeData($.NSString.alloc.initWithString(JSON.stringify({ok:false,error:{name:e.name||'Error',message:e.message||String(e)}})+'\\n').dataUsingEncoding($.NSUTF8StringEncoding));
      }
    })();
  `;
  const result = spawnSync("osascript", ["-l", "JavaScript"], {
    input: script,
    encoding: "utf-8",
    timeout: 15_000,
  });
  const line = (result.stdout || "").split("\n").find((l) => l.trim().startsWith("{"));
  if (!line) throw new Error(`createTestTag: no JSON in output: ${result.stdout}`);
  const parsed = JSON.parse(line) as { ok: boolean; data?: { id: string }; error?: { message: string } };
  if (!parsed.ok || !parsed.data) throw new Error(`createTestTag failed: ${parsed.error?.message}`);
  return parsed.data.id;
}

/**
 * Deletes a tag by id.primaryKey. Silent if not found.
 * Uses inline JXA so it does not depend on the delete_tag snippet.
 */
export async function deleteTestTag(tagId: string): Promise<void> {
  const { spawnSync } = await import("child_process");
  const snippet = `(() => {
    var tag = flattenedTags.find(function(t){ return t.id.primaryKey === ${JSON.stringify(tagId)}; });
    if (tag) deleteObject(tag);
    return JSON.stringify({ok:true,data:null});
  })()`;
  const script = `
    (function() {
      var app = Application('OmniFocus');
      app.includeStandardAdditions = true;
      try {
        var r = app.evaluateJavascript(${JSON.stringify(snippet)});
        $.NSFileHandle.fileHandleWithStandardOutput.writeData($.NSString.alloc.initWithString(r+'\\n').dataUsingEncoding($.NSUTF8StringEncoding));
      } catch(e) {
        $.NSFileHandle.fileHandleWithStandardOutput.writeData($.NSString.alloc.initWithString(JSON.stringify({ok:true,data:null})+'\\n').dataUsingEncoding($.NSUTF8StringEncoding));
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
