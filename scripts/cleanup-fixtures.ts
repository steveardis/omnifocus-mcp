/**
 * Cleanup script: removes any stale __MCP_TEST_*__ folders, __mcp_*__ projects,
 * __MCP_*__ tags, and __mcp_*__ inbox tasks from OmniFocus.
 * Run via: npm run test:cleanup-fixtures
 */

import { spawnSync } from "child_process";

const snippet = `(() => {
  function deleteFolder(f) {
    f.flattenedProjects.forEach(function(p) { deleteObject(p); });
    f.folders.forEach(function(child) { deleteFolder(child); });
    deleteObject(f);
  }
  var removed = [];

  // Stale test folders
  flattenedFolders.filter(function(f) {
    return f.name.startsWith('__MCP_TEST_') && f.name.endsWith('__');
  }).forEach(function(f) { removed.push("folder: " + f.name); deleteFolder(f); });

  // Stale test projects (orphaned at top level by move_project tests)
  flattenedProjects.filter(function(p) {
    return p.name.startsWith('__mcp_') && p.name.endsWith('__');
  }).forEach(function(p) { removed.push("project: " + p.name); deleteObject(p); });

  // Stale test tags
  flattenedTags.filter(function(t) {
    return (t.name.startsWith('__mcp_') || t.name.startsWith('__MCP_')) && t.name.endsWith('__');
  }).forEach(function(t) { removed.push("tag: " + t.name); deleteObject(t); });

  // Stale test inbox tasks
  inbox.filter(function(t) {
    return t.name.startsWith('__mcp_') && t.name.endsWith('__');
  }).forEach(function(t) { removed.push("task: " + t.name); deleteObject(t); });

  return JSON.stringify({ok:true,data:{removed:removed,count:removed.length}});
})()`;

const script = `
(function() {
  var app = Application('OmniFocus');
  app.includeStandardAdditions = true;
  try {
    var r = app.evaluateJavascript(${JSON.stringify(snippet)});
    $.NSFileHandle.fileHandleWithStandardOutput.writeData(
      $.NSString.alloc.initWithString(r+'\\n').dataUsingEncoding($.NSUTF8StringEncoding)
    );
  } catch(e) {
    $.NSFileHandle.fileHandleWithStandardOutput.writeData(
      $.NSString.alloc.initWithString(JSON.stringify({ok:false,error:{message:e.message}})+'\\n').dataUsingEncoding($.NSUTF8StringEncoding)
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
if (!line) {
  console.error("No output from OmniFocus:", stdout);
  process.exit(1);
}

const parsed = JSON.parse(line) as {
  ok: boolean;
  data?: { removed: string[]; count: number };
  error?: { message: string };
};

if (!parsed.ok) {
  console.error("Cleanup failed:", parsed.error?.message);
  process.exit(1);
}

const { removed, count } = parsed.data!;
if (count === 0) {
  console.log("No stale test fixtures found.");
} else {
  console.log(`Removed ${count} stale test fixture(s):`);
  for (const item of removed) {
    console.log(`  - ${item}`);
  }
}
