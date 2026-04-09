/**
 * Cleanup script: removes any stale __MCP_TEST_*__ folders from OmniFocus.
 * Run via: npm run test:cleanup-fixtures
 */

import { spawnSync } from "child_process";

const snippet = `(() => {
  function deleteFolder(f) {
    f.flattenedProjects.forEach(function(p) { deleteObject(p); });
    f.folders.forEach(function(child) { deleteFolder(child); });
    deleteObject(f);
  }
  var stale = flattenedFolders.filter(function(f) {
    return f.name.startsWith('__MCP_TEST_') && f.name.endsWith('__');
  });
  var removed = stale.map(function(f) { return f.name; });
  stale.forEach(function(f) { deleteFolder(f); });
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
  for (const name of removed) {
    console.log(`  - ${name}`);
  }
}
