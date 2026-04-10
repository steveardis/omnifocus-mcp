## Why

OmniFocus needs an MCP server that exposes the full Omni Automation JavaScript API to LLM callers. A prior AppleScript-string-generating server exists but has structural limitations: it cannot create folders, cannot create Single Actions lists, cannot move tasks between projects, cannot set recurrence rules, returns no stable IDs, breaks on apostrophes in names, silently routes to the wrong target on duplicate names, and mis-parses successful results as errors. These are not bugs to patch — they are consequences of generating AppleScript source as concatenated strings against a scripting dictionary that lacks the needed capabilities.

This change starts from a clean slate with an architecture that kills those bug classes by construction: all operations execute inside OmniFocus's OmniJS runtime (where the modern API lives) via a JXA bridge, arguments are embedded as JSON literals (never concatenated), identity is always `id.primaryKey`, and results flow as a strict one-line JSON protocol. This first change establishes the runtime foundation and names every capability that will eventually exist, so subsequent changes can fill in the API surface incrementally without re-litigating the architecture.

## What Changes

- Establish a TypeScript MCP server scaffold (`@modelcontextprotocol/sdk`, zod for schemas, vitest for tests) with `src/runtime/`, `src/snippets/`, `src/tools/`, `src/schemas/`, `src/server.ts`, `test/unit/`, `test/integration/`, `package.json`, `tsconfig.json`.
- Implement the execution runtime: a JXA shim that calls `Application('OmniFocus').evaluateJavascript(snippet)`, wraps results in a strict `{ok, data} | {ok: false, error}` envelope, and prints exactly one line of JSON to stdout.
- Implement the snippet-authoring convention: static `.js` files with a single `__ARGS__` placeholder, injected by `template.replace("__ARGS__", JSON.stringify(args))`. No other interpolation is permitted anywhere in the codebase.
- Implement the identity model: every read returns `id.primaryKey`; every write will accept `id` as the canonical address. Name/path resolution is a separate `resolve_name` tool that returns candidate lists on ambiguity and never silently picks a winner.
- Deliver the minimum-viable read surface needed to prove the bridge end-to-end: `list_projects`, `get_project`, `list_folders`, `get_folder`, `list_tasks`, `get_task`, `list_tags`, `get_tag`, `resolve_name`. No mutating tools in this change.
- Establish the integration-test harness against a real OmniFocus instance, with all fixtures scoped under a disposable `__MCP_TEST_<uuid>__` top-level folder and a preflight that refuses to run when OmniFocus sync is enabled (unless `MCP_TEST_ALLOW_SYNC=1`).
- Name every target capability as a stub spec so future changes have a landing place: `recurrence`, `perspective-management`, `window-state`, `forecast`, `database-inspection`, `batch-operations`, `attachments`, `url-automation`, `settings`. Stubs declare scope and non-goals without specifying requirements that later changes will own.
- Document explicit non-goals: interactive UI APIs (`Form`, `Alert`, `FilePicker`, `FileSaver`), `Speech`, `Device`, clipboard mutation, window mutation, notifications, and custom perspective creation/editing. These are recorded as non-goals in design.md so they don't look like oversights.

## Capabilities

### New Capabilities

- `execution-runtime`: The JXA→OmniJS bridge, snippet loader, argument-injection rule, one-line JSON result protocol, and error model. Fully specified in this change.
- `identity-resolution`: `id.primaryKey` addressing, name/path resolution with ambiguity reporting, and the `resolve_name` tool contract. Fully specified in this change.
- `task-management`: Task read operations (`list_tasks`, `get_task`) specified in this change; full CRUD, move, completion, and hierarchy operations land in the `core-crud` change.
- `project-management`: Project read operations (`list_projects`, `get_project`) specified in this change; CRUD, type (parallel/sequential/singleActions), status, and review metadata land in `core-crud`.
- `folder-management`: Folder read operations (`list_folders`, `get_folder`) specified in this change; CRUD, nesting, rename, and move land in `core-crud`.
- `tag-management`: Tag read operations (`list_tags`, `get_tag`) specified in this change; CRUD, nesting, assignment, and status land in `core-crud`.
- `recurrence`: Stub naming the capability for Task.RepetitionRule construction, RepetitionMethod, structured schema plus raw RRULE escape hatch, and clearing recurrence. Requirements land in the `recurrence` change.
- `perspective-management`: Stub naming the capability for listing built-in and custom perspectives, activating a perspective in a window, and reading perspective details. Custom perspective creation/editing is a non-goal pending API verification.
- `window-state`: Stub naming the capability for read-only window state (current window, active perspective, sidebar selection, content selection). Window mutation is a non-goal.
- `forecast`: Stub naming the capability for forecast days, tasks due/deferred on a day, and forecast metadata.
- `database-inspection`: Stub naming the capability for scoped, paged, filtered database traversal including `dump_database`, inbox contents, and database metadata.
- `batch-operations`: Stub naming the capability for batch variants of mutating tools with per-item result arrays and partial-success semantics.
- `attachments`: Stub naming the capability for `FileWrapper`-based attachment listing and round-trip on task notes.
- `url-automation`: Stub naming the capability for `omnifocus://` URL construction and parsing.
- `settings`: Stub naming the capability for reading app settings and preferences where exposed.

### Modified Capabilities

None. This is a clean-slate project with no prior specs.

## Impact

- **New repository structure** with TypeScript toolchain, MCP SDK, zod, vitest.
- **Runtime dependency on macOS** (`osascript`) and a running OmniFocus instance. The server is macOS-only by nature of the Omni Automation platform.
- **Integration tests mutate a real OmniFocus database.** Mitigated by fixture-folder scoping and a sync-enabled preflight check. Documented loudly in the README.
- **No CI coverage for integration tests.** CI runs unit tests only (snippet injection, zod schema validation, result-protocol parsing). Integration is local-developer-only.
- **Replaces a prior AppleScript-based MCP server.** Callers migrating from the old server will encounter breaking changes in tool names, parameter types, and result shapes. This is accepted because the prior server's contract was structurally broken; compatibility is not a goal.
- **No external network dependencies.** The server runs entirely locally against the user's OmniFocus database.
