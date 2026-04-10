# omnifocus-mcp

An MCP server for OmniFocus that exposes the full Omni Automation JavaScript API to LLM callers.

**macOS only.** Requires OmniFocus running on the same machine. The entire implementation runs OmniJS snippets inside OmniFocus via `osascript -l JavaScript` — no AppleScript string generation, no scripting dictionary limitations.

## Prerequisites

- macOS (Omni Automation is macOS-only; the server will not start on other platforms)
- OmniFocus installed and **running**
- Node.js ≥ 20

## Install

```bash
npm install
npm run build
```

## MCP Client Configuration

Add to your MCP client config (e.g. Claude Desktop `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "omnifocus": {
      "command": "node",
      "args": ["/absolute/path/to/omnifocus-mcp/dist/server.js"]
    }
  }
}
```

For development (no build step):

```json
{
  "mcpServers": {
    "omnifocus": {
      "command": "npx",
      "args": ["tsx", "/absolute/path/to/omnifocus-mcp/src/server.ts"]
    }
  }
}
```

## Available Tools

### Read

| Tool | Description |
|---|---|
| `list_projects` | Projects with optional filtering by status, folderId, flagged. Default excludes done/dropped. Limit (default 100). |
| `get_project` | Full project detail by stable ID |
| `list_tasks` | Tasks scoped by `projectId`, `folderId`, `inbox: true`, or `all: true` with optional status/tag/due/flagged filters. Limit (default 200). |
| `get_task` | Full task detail by stable ID — includes defer/planned/due dates, tags, repetition rule, parentTaskId |
| `list_folders` | Folders with optional status filter. Limit (default 200). |
| `get_folder` | Full folder detail by stable ID, including child folder and project IDs |
| `list_tags` | Tags with optional status filter. Limit (default 200). |
| `get_tag` | Full tag detail by stable ID, including child tag IDs |
| `resolve_name` | Resolve a name to stable ID candidates — **never silently disambiguates**; returns all matches |

### Write

| Tool | Description |
|---|---|
| `create_task` | Create a task in inbox, project, or as subtask. Supports defer/planned/due dates, tags, flagged, estimated minutes, and repetition rules. |
| `edit_task` | Edit any task field. Pass `null` to clear dates or repetition. Omitted fields are unchanged. |
| `complete_task` | Mark a task complete |
| `drop_task` | Mark a task dropped |
| `delete_task` | Permanently delete a task and all subtasks |
| `create_project` | Create a project, optionally in a folder. Supports type, status, review interval, tags. |
| `edit_project` | Edit project fields |
| `complete_project` | Mark a project complete |
| `drop_project` | Mark a project dropped |
| `delete_project` | Permanently delete a project and all its tasks |
| `create_folder` | Create a folder, optionally nested |
| `edit_folder` | Rename a folder |
| `delete_folder` | Permanently delete a folder and entire subtree |
| `create_tag` | Create a tag, optionally nested |
| `edit_tag` | Edit tag name or status |
| `delete_tag` | Permanently delete a tag and child tags |
| `move_task` | Move a task to a project or make it a subtask of another task |
| `move_project` | Move a project to a folder or to top level |

### Addressing model

Every entity returned by this server includes a stable `id` field (`id.primaryKey` from OmniFocus). Use this ID in subsequent calls rather than names. Names can be ambiguous; IDs are not.

If you have a name but not an ID, use `resolve_name`. It returns a list — if multiple candidates are returned, inspect the `path` field and ask the user to disambiguate before proceeding with any write operation.

## Comparison with other OmniFocus MCP servers

Two notable alternatives exist:
[themotionmachine/OmniFocus-MCP](https://github.com/themotionmachine/OmniFocus-MCP) and
[jqlts1/omnifocus-mcp-enhanced](https://github.com/jqlts1/omnifocus-mcp-enhanced) (a fork of the above with additional tools).

**Scripting API.** The alternatives use the JXA scripting dictionary or AppleScript to drive OmniFocus. This server makes a single JXA call — `Application('OmniFocus').evaluateJavascript()` — and runs all logic as OmniJS (Omni Automation) inside OmniFocus. This gives access to the full Omni Automation API surface (recurrence rules, review intervals, perspectives, forecast, attachments, URL automation, etc.) rather than the more limited scripting dictionary.

**Argument injection.** The alternatives construct osascript commands via string interpolation, which can break on apostrophes, quotes, backslashes, and unicode in names. This server serializes all arguments with `JSON.stringify` into a JS literal.

**Entity addressing.** The alternatives address entities primarily by name. This server returns a stable `id` (`id.primaryKey`) for every entity and provides `resolve_name` to map a name to ID candidates — returning all matches with full paths rather than silently picking one when names are ambiguous.

**Full CRUD.** This server supports creating, editing, completing, dropping, deleting, and moving tasks, projects, folders, and tags — plus repetition rules and OmniFocus 4's planned date.

## Development

```bash
# Type-check without building
npm run typecheck

# Run unit tests (no OmniFocus required)
npm test

# Build
npm run build
```

## Testing

### Unit tests (no OmniFocus required)

```bash
npm test
```

### Integration tests

> ⚠️ **Integration tests run against your real OmniFocus database.**
>
> Each test run creates a temporary top-level folder named `__MCP_TEST_<uuid>__` and deletes it on teardown. If a test run is interrupted before teardown, run the cleanup script:
>
> ```bash
> npm run test:cleanup-fixtures
> ```

> ⚠️ **Sync warning:** By default, integration tests refuse to run if OmniFocus sync is enabled, to prevent test fixtures from propagating to your other devices. Disable OmniFocus sync first, or set `MCP_TEST_ALLOW_SYNC=1` to opt in (fixtures will sync):

```bash
# Default (refuses if sync enabled)
npm run test:integration

# With sync enabled (use carefully)
MCP_TEST_ALLOW_SYNC=1 npm run test:integration
```

### Clean up stale test fixtures

```bash
npm run test:cleanup-fixtures
```

This removes any `__MCP_TEST_*__` folders and orphaned `__mcp_*__` projects/tags left in OmniFocus from interrupted test runs.

## Contributing

Contributions are welcome! Here's how to get started:

1. **Fork and clone** the repo
2. **Install dependencies:** `npm install`
3. **Run unit tests** (no OmniFocus needed): `npm test`
4. **Run integration tests** (requires macOS + OmniFocus): `npm run test:integration`

### Before submitting a PR

- `npm run typecheck` — must pass with no errors
- `npm test` — all unit tests must pass
- `npm run test:integration` — all integration tests must pass (macOS only)
- Keep changes focused — one feature or fix per PR

### Architecture overview

The server runs OmniJS snippets inside OmniFocus via `osascript -l JavaScript`. Each tool has three layers:

- **Schema** (`src/schemas/shapes.ts`) — Zod schemas for input validation and output parsing
- **Snippet** (`src/snippets/*.js`) — OmniJS code that runs inside OmniFocus. Plain ES5 JavaScript (no imports, no TypeScript). Arguments are injected via `__ARGS__` placeholder.
- **Tool handler** (`src/tools/*.ts`) — Validates input, calls `runSnippet()`, parses the result

When adding a new tool:
1. Define input/output schemas in `src/schemas/shapes.ts` and export from `src/schemas/index.ts`
2. Create the OmniJS snippet in `src/snippets/`
3. Add the snippet name to `ALLOWED_SNIPPETS` in `src/runtime/snippetLoader.ts`
4. Create the tool handler in `src/tools/` and register it in `src/tools/index.ts`
5. Add unit tests for schemas and integration tests that run against OmniFocus

### Writing OmniJS snippets

Snippets run inside OmniFocus's JavaScript runtime, not Node.js. Key constraints:

- **ES5-style JavaScript** — use `var`, `function(){}`, no arrow functions in older OmniFocus versions
- **No imports** — all OmniJS globals (`flattenedTasks`, `flattenedProjects`, `moveTasks`, etc.) are available directly
- **Return JSON** — always `return JSON.stringify({ ok: true, data: ... })`
- **Error pattern** — throw named errors (`NotFoundError`, `ValidationError`) which the bridge catches and wraps

## License

[MIT](LICENSE)
