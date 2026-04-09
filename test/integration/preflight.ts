import { runSnippet } from "../../src/runtime/index.js";

const SYNC_CHECK_SNIPPET_NAME = "check_sync_enabled";

// Inline snippet: no src/snippets file needed for this one-off preflight check.
// We run it via the bridge directly using a temporary approach.
async function isSyncEnabled(): Promise<boolean> {
  try {
    // OmniJS: check if the database has sync settings configured
    const { spawnSync } = await import("child_process");
    const script = `
      (function() {
        try {
          var app = Application('OmniFocus');
          app.includeStandardAdditions = true;
          var snippet = "(function() { try { var db = document; var sync = db.willSynchronize !== undefined ? db.willSynchronize : false; return JSON.stringify({ok:true,data:{syncEnabled:sync}}); } catch(e) { return JSON.stringify({ok:true,data:{syncEnabled:false}}); } })()";
          var result = app.evaluateJavascript(snippet);
          $.NSFileHandle.fileHandleWithStandardOutput.writeData(
            $.NSString.alloc.initWithString(result + '\\n').dataUsingEncoding($.NSUTF8StringEncoding)
          );
        } catch(e) {
          $.NSFileHandle.fileHandleWithStandardOutput.writeData(
            $.NSString.alloc.initWithString(JSON.stringify({ok:true,data:{syncEnabled:false}}) + '\\n').dataUsingEncoding($.NSUTF8StringEncoding)
          );
        }
      })();
    `;
    const result = spawnSync("osascript", ["-l", "JavaScript"], {
      input: script,
      encoding: "utf-8",
      timeout: 10_000,
    });
    if (result.stdout) {
      const parsed = JSON.parse(result.stdout.trim()) as {
        ok: boolean;
        data: { syncEnabled: boolean };
      };
      if (parsed.ok) return parsed.data.syncEnabled;
    }
    return false;
  } catch {
    return false;
  }
}

export async function setup(): Promise<void> {
  if (process.platform !== "darwin") {
    throw new Error(
      "Integration tests require macOS (OmniFocus + osascript unavailable)"
    );
  }

  const syncEnabled = await isSyncEnabled();
  if (syncEnabled && !process.env["MCP_TEST_ALLOW_SYNC"]) {
    throw new Error(
      "OmniFocus sync is enabled. Integration tests would propagate fixture folders to other devices.\n" +
        "Set MCP_TEST_ALLOW_SYNC=1 to run anyway (fixtures will sync), or disable sync first."
    );
  }
}
