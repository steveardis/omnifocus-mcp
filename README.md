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

### This release (read-only, proving the JXA→OmniJS bridge)

| Tool | Description |
|---|---|
| `list_projects` | All projects — id, name, folder path, status, type |
| `get_project` | Full project detail by stable ID |
| `list_folders` | All folders — id, name, full path (ancestors joined with `▸`), parentId, status |
| `get_folder` | Full folder detail by stable ID, including child folder and project IDs |
| `list_tasks` | Tasks scoped by `projectId`, `folderId`, `inbox: true`, or `all: true` |
| `get_task` | Full task detail by stable ID, including defer/due dates and tag IDs |
| `list_tags` | All tags — id, name, full path, parentId, status |
| `get_tag` | Full tag detail by stable ID, including child tag IDs |
| `resolve_name` | Resolve a name to stable ID candidates — **never silently disambiguates**; returns all matches |

### Addressing model

Every entity returned by this server includes a stable `id` field (`id.primaryKey` from OmniFocus). Use this ID in subsequent calls rather than names. Names can be ambiguous; IDs are not.

If you have a name but not an ID, use `resolve_name`. It returns a list — if multiple candidates are returned, inspect the `path` field and ask the user to disambiguate before proceeding with any write operation.

### Coming in subsequent releases

Full CRUD on tasks, projects, folders, and tags; recurrence rules; perspectives and window state; forecast; batch operations; attachments; URL automation; settings.

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

This removes any `__MCP_TEST_*__` folders left in OmniFocus from interrupted test runs.
