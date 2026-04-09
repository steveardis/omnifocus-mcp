import { spawn } from "child_process";
import { loadSnippet } from "./snippetLoader.js";
import { buildJxaScript } from "./jxaShim.js";
import { parseResultLine, ExecutionError } from "./resultProtocol.js";

const DEFAULT_TIMEOUT_MS = 30_000;

export interface RunOptions {
  timeoutMs?: number;
}

/**
 * Execute an OmniJS snippet inside OmniFocus via the JXA bridge.
 *
 * @param name - Snippet filename (without .js extension) under src/snippets/
 * @param args - Arguments to inject. Embedded as a JSON literal; safe for
 *               all unicode, apostrophes, quotes, etc. (Design Decision 2).
 * @param opts - Optional timeout override (default 30s)
 * @returns The `data` field from the success envelope
 * @throws ExecutionError if the snippet throws inside OmniJS
 * @throws Error on timeout, process errors, or protocol violations
 */
export async function runSnippet(
  name: string,
  args: unknown,
  opts: RunOptions = {}
): Promise<unknown> {
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  // Load and inject args — the only interpolation allowed (Decision 2)
  const template = loadSnippet(name);
  const snippet = template.replace("__ARGS__", JSON.stringify(args));

  // Wrap snippet in JXA shim
  const jxaScript = buildJxaScript(snippet);

  return new Promise((resolve, reject) => {
    const MAX_OUTPUT_BYTES = 10 * 1024 * 1024; // 10 MB

    const ac = new AbortController();
    const timer = setTimeout(() => {
      ac.abort();
      child.kill("SIGKILL");
      reject(new Error(`Snippet "${name}" timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    const child = spawn("osascript", ["-l", "JavaScript"], {
      signal: ac.signal,
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
      if (stdout.length > MAX_OUTPUT_BYTES) {
        child.kill("SIGKILL");
        clearTimeout(timer);
        reject(new Error(`Snippet "${name}" exceeded maximum output size`));
      }
    });

    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    child.on("error", (err) => {
      clearTimeout(timer);
      if ((err as NodeJS.ErrnoException).code === "ABORT_ERR") return; // handled by timer
      reject(err);
    });

    child.on("close", (code) => {
      clearTimeout(timer);
      try {
        const envelope = parseResultLine(stdout);
        if (envelope.ok) {
          resolve(envelope.data);
        } else {
          reject(new ExecutionError(envelope.error));
        }
      } catch (parseErr) {
        const hint = stdout.slice(0, 200) || stderr.slice(0, 200);
        reject(
          new Error(
            `Failed to parse bridge output for snippet "${name}" (exit ${code})` +
              (hint ? `: ${hint}` : "")
          )
        );
      }
    });

    // Write JXA script to stdin
    child.stdin.write(jxaScript);
    child.stdin.end();
  });
}
