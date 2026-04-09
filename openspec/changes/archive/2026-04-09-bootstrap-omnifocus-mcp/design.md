## Context

OmniFocus exposes two distinct automation surfaces on macOS:

1. **The scripting dictionary**, reachable from AppleScript and JXA (`osascript -l JavaScript`). This is the legacy surface the prior MCP server targeted by generating AppleScript source strings. It lacks folder creation, Single Actions list type, task moves, stable IDs, and recurrence-rule construction. It also requires string-concatenation of arguments, which is the root cause of the apostrophe and name-ambiguity bug classes.

2. **OmniJS**, the modern Omni Automation JavaScript runtime that lives *inside* the OmniFocus process. This is the API documented at omni-automation.com. It exposes `Task`, `Project`, `Folder`, `Tag`, `Task.RepetitionRule`, `Perspective`, `id.primaryKey`, `moveTasks`, `new Folder`, and everything else the prior server couldn't reach. It is reachable from outside OmniFocus *only* via the `evaluateJavascript` method on the scripting-dictionary application object.

The two are not interchangeable. The scripting dictionary is a capability-limited facade over the same underlying database; OmniJS is the authoritative modern API. Every "cannot do X" limitation in the prior server is a limitation of the scripting dictionary, not of JXA or macOS automation generally.

The project starts from a clean slate: no legacy code, no prior specs, no backwards-compatibility constraints. The only inputs are the Omni Automation API surface, the MCP protocol, and the enumerated failure modes of the prior server.

## Goals / Non-Goals

**Goals:**

- Expose the full Omni Automation API surface through an MCP server, eventually reaching 1:1 coverage. This change establishes the foundation; subsequent changes fill in capabilities.
- Eliminate by construction the bug classes of the prior server: apostrophe-breaking, name-ambiguity routing, parse-error-on-success, type-coercion failures in batch parameters, missing capability coverage.
- Make every domain operation authored as a static, standalone `.js` snippet that can be pasted into OmniFocus's Automation Console for manual verification.
- Provide stable, id-based addressing for every OmniFocus entity, with name/path resolution as a separate, explicit, ambiguity-reporting step.
- Establish an integration-test harness that exercises a real OmniFocus instance without polluting the user's data or leaking fixtures across sync.
- Name every target capability up front so future changes have a landing place and the scope of "full API coverage" is visible from the first commit.

**Non-Goals:**

- Cross-platform support. Omni Automation is macOS-only; the server is macOS-only.
- Compatibility with the prior AppleScript-based MCP server. Tool names, parameter shapes, and result envelopes are all new.
- Interactive UI automation: `Form`, `Alert`, `FilePicker`, `FileSaver`. These APIs require a human to click in the OmniFocus app while the script blocks; they cannot cross an MCP boundary without changing semantics.
- Device-local side effects unrelated to OmniFocus data: `Speech`, `Device`, clipboard mutation.
- Window mutation (resize, close, focus). Window *state* is exposed read-only; mutation is low-value and fragile.
- User-visible notifications posted from scripts. Out by default; reconsiderable if a concrete use case emerges.
- Custom perspective *creation and editing*. Listing and activation are in scope; programmatic definition of perspective rules is likely not scriptable even in OmniFocus Pro and is marked non-goal pending verification when the perspective-management change is drafted.
- CI coverage for integration tests. CI runs unit tests only; integration tests are local-developer-only by the nature of requiring a running OmniFocus instance.
- Transactional semantics across batch operations. OmniFocus does not expose transactions; batch tools return per-item result arrays with partial-success semantics.

## Decisions

### Decision 1: JXA is a thin shim; all domain logic runs inside OmniJS via `evaluateJavascript`.

**Choice:** Every tool invocation spawns `osascript -l JavaScript` running a minimal JXA wrapper whose only job is to call `Application('OmniFocus').evaluateJavascript(snippet)`, catch exceptions, and print one line of JSON to stdout. All domain logic — creating folders, setting project types, constructing repetition rules, reading IDs, walking hierarchies — lives in OmniJS snippets and runs inside the OmniFocus process.

**Rationale:** The capability gap between the scripting dictionary and OmniJS is the *entire* reason the prior server failed to cover critical features. Targeting OmniJS directly is the only path to feature parity with the Omni Automation API. JXA's only value here is as the carrier that reaches `evaluateJavascript`; nothing else in the JXA scripting-dictionary surface is used.

**Alternatives considered:**

- *Pure AppleScript, better escaping.* Rejected: the capability gap is structural; no amount of escaping fixes the missing folder, type, move, ID, and recurrence capabilities.
- *`omnifocus://` URL automation.* Rejected: URL schemes support a narrow slice of operations (add to inbox, open document, complete task) and provide no return channel for IDs or query results.
- *OmniFocus plug-in bundles installed into the user's library.* Rejected: requires out-of-band user setup, complicates distribution, and still requires an IPC channel back to the MCP server.
- *Shortcuts.app automation.* Rejected: similar return-channel and capability limitations, and adds a dependency on Shortcuts being configured.

**Bugs this kills:** "cannot create folders," "cannot create Single Actions list," "cannot move tasks between projects," "no project IDs returned," "cannot set recurrence," "folder name ambiguity" (because paths can be resolved via `flattenedFolders` inside OmniJS rather than scripting-dictionary `whose` clauses).

### Decision 2: Arguments are embedded as JSON literals; no string interpolation anywhere.

**Choice:** Snippet files are static `.js` files containing exactly one placeholder token: `__ARGS__`. At runtime, the TypeScript side constructs the script to execute via `template.replace("__ARGS__", JSON.stringify(args))`. The snippet reads `const args = __ARGS__;` as its first line. No other interpolation of user-supplied data into script source is permitted anywhere in the codebase.

**Rationale:** JSON is a syntactic subset of JavaScript. `JSON.stringify` of any JavaScript value produces a string that is both valid JSON and a valid JavaScript expression literal. Embedding it directly into source is injection-safe for arbitrary strings, including apostrophes, quotes, backslashes, newlines, unicode, and emoji — precisely the inputs that broke the prior server. It also has the useful property that the generated script is a standalone, paste-ready snippet: a developer can hand-edit `__ARGS__` in the template and paste it into OmniFocus's Automation Console to reproduce any operation.

**Alternatives considered:**

- *Passing arguments via environment variables.* Rejected: `evaluateJavascript` runs inside OmniFocus's process, which does not inherit the `osascript` environment. The snippet could not read them.
- *Writing arguments to a temp file and having the snippet read it.* Rejected: OmniJS has no general filesystem read primitive; `FileWrapper` is attachment-scoped. Adds a cleanup burden and a failure mode.
- *String-escape templating (Handlebars, Mustache, manual backslash escaping).* Rejected: every escape scheme has edge cases. The JSON-literal approach has none because JSON is closed under JavaScript expression syntax.

**Bugs this kills:** "apostrophes in task/project names break AppleScript string generation," plus the entire class of unicode and escape-sequence bugs that haven't been hit yet but would eventually surface under string concatenation.

### Decision 3: Results flow as exactly one line of JSON on stdout.

**Choice:** Every snippet's last expression is `JSON.stringify({ok: true, data: <result>})` or throws. The JXA shim wraps the `evaluateJavascript` call in try/catch. On success, it prints the returned string verbatim followed by a single newline. On failure, it prints `JSON.stringify({ok: false, error: {name, message, stack}})` followed by a single newline. The TypeScript runtime reads stdout, takes the first JSON-parseable line, and asserts `ok`.

**Rationale:** A strict protocol eliminates ambiguity about whether an operation succeeded. The prior server's "parse error on success" bug was a direct consequence of treating incidental AppleScript output as part of the result payload. With a one-line JSON contract, success and failure are trivially distinguishable and the protocol is easy to test in isolation.

**Alternatives considered:**

- *Multi-line JSON with framing.* Rejected: unnecessary complexity for the single-operation-per-invocation model.
- *Exit code as the success signal.* Rejected: `osascript` exit codes are unreliable across JXA error modes, and an exit code doesn't carry error details.
- *Writing results to a temp file.* Rejected: adds a cleanup burden and a filesystem round-trip with no benefit.

**Bugs this kills:** "`remove_item` returns parse error on success even when operation succeeded."

### Decision 4: `id.primaryKey` is the canonical address for every entity; name resolution is a separate, explicit, ambiguity-reporting step.

**Choice:** Every read tool returns `{id, ...}` where `id` is `obj.id.primaryKey`. Every write tool (in this and future changes) accepts `id` as the primary addressing parameter. Name and path resolution is a dedicated `resolve_name` tool that takes `{type, query, scope?}` and returns a list of candidate `{id, name, path, ...}` entries. When more than one candidate matches, the tool returns all of them and the caller must decide; it never silently picks.

**Rationale:** The prior server's duplicate-name and folder-ambiguity bugs are consequences of name-based addressing with silent disambiguation. IDs are stable across sessions within OmniFocus. Making ID the canonical address and forcing callers (including LLMs) to resolve ambiguity explicitly is the only way to produce deterministic behavior in a database where names are user-chosen and frequently collide.

**Alternatives considered:**

- *Name-based addressing with a "pick the first match" default.* Rejected: this is exactly what the prior server did, and it routed to the wrong target.
- *Path-only addressing.* Rejected: paths are fragile to user renames and still ambiguous when the same path exists under different roots (e.g., the same tag name under different parents).
- *Auto-disambiguation via fuzzy scoring.* Rejected: silent selection is precisely the failure mode being fixed.

**Open question:** Whether `id.primaryKey` values survive OmniFocus sync across devices and across database rebuilds. This is believed to be true but will be verified during the execution-runtime implementation and documented in the runtime README. If IDs turn out not to survive sync, the contract still holds within a single session; callers re-resolving after a sync event is an acceptable fallback.

**Bugs this kills:** "duplicate project names cause wrong-target routing," "folder name ambiguity — same folder name under different parents routes incorrectly," "no project IDs returned — projects only addressable by name."

### Decision 5: Tool parameters are validated with zod at the TS boundary; enums are strict; no type coercion.

**Choice:** Every MCP tool handler defines its input schema as a zod object. Handlers receive already-parsed, already-validated arguments. Enums like project type are `z.enum(["parallel", "sequential", "singleActions"])`. Batch arrays are `z.array(z.object({...}))` — never strings that look like JSON. Invalid inputs are rejected at the TS boundary with structured error messages before any snippet runs.

**Rationale:** The prior server had `sequential` parameters that arrived as strings and were treated as booleans with broken coercion, and `batch_remove_items` parameters that arrived as serialized JSON strings instead of arrays. These are the bug pattern you get when tool schemas are loose and the handler does ad-hoc type massaging. zod at the boundary makes the schema the contract.

**Alternatives considered:**

- *Ad-hoc `typeof` checks in handlers.* Rejected: this is what produced the original bugs.
- *JSON Schema validation via ajv.* Considered and deferred: zod is TypeScript-native, produces better type inference, and integrates naturally with the MCP SDK's expected schema surface. ajv is fine but adds a second schema language.

**Bugs this kills:** "`sequential` parameter must be a true boolean, not string," "`batch_remove_items` items parameter must be a JSON array, not serialized string."

### Decision 6: Integration tests scope all fixtures under a disposable folder and refuse to run under sync by default.

**Choice:** Every integration test run generates a UUID and creates a top-level folder named `__MCP_TEST_<uuid>__` in the user's OmniFocus database. All fixture projects, folders, tasks, and tags are created inside it. Teardown deletes the folder and everything under it. A preflight check inspects the database's sync configuration and refuses to run if sync is enabled, unless `MCP_TEST_ALLOW_SYNC=1` is set in the environment. Integration tests run serially (OmniFocus is a singleton). CI runs unit tests only.

**Rationale:** Integration tests against a real OmniFocus instance are the only way to validate the OmniJS API contract — mocks would drift. But real-database testing has a failure mode where fixtures leak into the user's actual workflow or, worse, sync to other devices. Fixture-folder scoping contains the blast radius; the sync preflight prevents cross-device leakage by default with an explicit opt-out for users who understand the tradeoff.

**Alternatives considered:**

- *Mocking the OmniJS API.* Rejected: this is the path to building something that passes tests and fails in production.
- *Dedicated test OmniFocus document.* Rejected: OmniFocus does not support multiple documents in a way that's ergonomic for automated switching.
- *Snapshot-and-restore the database.* Rejected: there is no supported API for this; copying the sqlite file behind OmniFocus's back is unsafe.

## Risks / Trade-offs

- **Risk:** `id.primaryKey` may not survive OmniFocus sync or database rebuilds. → **Mitigation:** Verify during runtime implementation and document findings. If IDs don't survive sync, document the session-scope guarantee and update `resolve_name` guidance accordingly. This is an open question, not a blocker.

- **Risk:** `evaluateJavascript` may have undocumented size limits on the script argument. → **Mitigation:** Keep snippets small and focused (one operation per file). For batch operations (future change), the snippet iterates over an args array; it does not inline per-item code.

- **Risk:** OmniJS error messages inside `evaluateJavascript` may be lossy when surfaced through JXA. → **Mitigation:** The snippet catches its own errors and constructs the error envelope itself before returning, so error details never cross the OmniJS→JXA boundary as a raw exception.

- **Risk:** Integration tests running against a real OmniFocus instance can still pollute the user's data if teardown fails mid-run. → **Mitigation:** Fixture folders are prefixed with `__MCP_TEST_` and include a UUID; a `clean-test-fixtures` dev script scans for and removes any stragglers. README documents the manual cleanup command.

- **Risk:** OmniFocus sync conflicts from concurrent modifications during a test run. → **Mitigation:** Serial test execution plus the sync preflight. Under the opt-in sync-allowed mode, users accept the risk explicitly.

- **Trade-off:** The MCP server is macOS-only. This is an inherent property of Omni Automation and not negotiable without abandoning the capability goals.

- **Trade-off:** Every tool invocation spawns an `osascript` process, which has startup cost. For single operations this is fine; for high-frequency batch operations it would be noticeable. Batch tools (future change) will therefore execute as a single snippet that iterates internally, not as a loop of tool calls from the caller side.

- **Trade-off:** Snippet files live outside the TypeScript compilation unit. Refactoring a shared OmniJS helper means editing `.js` files that tsc doesn't type-check. Accepted because testability-by-paste is more valuable than type-checking across the boundary; the JS side is small and exercised by integration tests.

## Bug-to-decision traceability

Every documented failure mode of the prior server is mapped to the decision that eliminates it, so the rationale survives archival:

| Prior-server bug | Killed by |
|---|---|
| Cannot create folders | Decision 1 (OmniJS exposes `new Folder`) |
| Cannot create Single Actions list | Decision 1 (OmniJS exposes `containsSingletonActions`) |
| Cannot move tasks between projects | Decision 1 (OmniJS exposes `moveTasks`) |
| No project IDs returned | Decisions 1 + 4 (`id.primaryKey` exists in OmniJS and is the canonical address) |
| Cannot set recurrence/repeat | Decision 1 (OmniJS exposes `Task.RepetitionRule`) |
| Apostrophes break script generation | Decision 2 (JSON-literal argument embedding) |
| Duplicate project names cause wrong-target routing | Decision 4 (ID addressing + ambiguity-reporting resolution) |
| Folder name ambiguity under different parents | Decision 4 (ID addressing + path-based resolution with ambiguity reporting) |
| `sequential` parameter must be a true boolean, not string | Decision 5 (zod enum validation at TS boundary) |
| `batch_remove_items` items parameter must be a JSON array | Decision 5 (zod array validation at TS boundary) |
| `remove_item` returns parse error on success | Decision 3 (strict one-line JSON result protocol) |

## Open Questions

- Do `id.primaryKey` values survive OmniFocus sync across devices and database rebuilds? To be verified during runtime implementation.
- Does `evaluateJavascript` have a practical size limit on the script argument? To be measured during runtime implementation and documented as an upper bound for future batch snippet design.
- Does OmniJS expose a reliable way to detect whether sync is enabled without mutating state? Needed for the integration-test preflight check. If not, the preflight falls back to reading the user's OmniFocus preferences via JXA before entering the OmniJS bridge.
