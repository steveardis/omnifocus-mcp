/**
 * JXA wrapper template. The `__SNIPPET__` placeholder is replaced with the
 * OmniJS snippet to execute. The resulting script is passed to
 * `osascript -l JavaScript` via stdin.
 *
 * This shim:
 *  - Calls Application('OmniFocus').evaluateJavascript() with the snippet
 *  - Wraps in try/catch
 *  - Prints exactly one line of JSON: {ok, data} | {ok: false, error: {...}}
 *
 * The JXA scripting dictionary is used ONLY for evaluateJavascript.
 * No other scripting-dictionary domain methods are invoked here.
 */
export const JXA_SHIM_TEMPLATE = `
(function() {
  var snippet = __SNIPPET__;
  var app = Application('OmniFocus');
  app.includeStandardAdditions = true;
  try {
    var result = app.evaluateJavascript(snippet);
    // result is already a JSON string produced by the snippet
    $.NSFileHandle.fileHandleWithStandardOutput.writeData(
      $.NSString.alloc.initWithString(result + '\\n')
        .dataUsingEncoding($.NSUTF8StringEncoding)
    );
  } catch(e) {
    var err = JSON.stringify({
      ok: false,
      error: {
        name: e.name || 'Error',
        message: e.message || String(e),
        stack: e.stack
      }
    });
    $.NSFileHandle.fileHandleWithStandardOutput.writeData(
      $.NSString.alloc.initWithString(err + '\\n')
        .dataUsingEncoding($.NSUTF8StringEncoding)
    );
  }
})();
`;

/**
 * Build the complete JXA script to pass to osascript.
 * The snippet is embedded as a JS string literal via JSON.stringify,
 * so it is safe to contain any characters including quotes, backslashes, etc.
 */
export function buildJxaScript(snippet: string): string {
  return JXA_SHIM_TEMPLATE.replace("__SNIPPET__", JSON.stringify(snippet));
}
