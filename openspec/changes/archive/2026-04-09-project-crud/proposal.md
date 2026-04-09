## Why

The bootstrap change delivered read-only project access. Callers can observe projects but cannot create, modify, complete, drop, or delete them — making the server unsuitable for any workflow that involves acting on projects.

## What Changes

- Add `create_project` tool: create a project in a folder or at the top level
- Add `edit_project` tool: modify any subset of a project's scalar fields, type, tags, and review interval in a single call
- Add `complete_project` tool: mark a project done
- Add `drop_project` tool: mark a project dropped
- Add `delete_project` tool: permanently delete a project and all its tasks (tool description instructs the AI to confirm with the user before invoking)

## Capabilities

### New Capabilities

- `project-write`: Create, edit, complete, drop, and permanently delete OmniFocus projects

### Modified Capabilities

_(none — existing `project-management` read requirements are unchanged)_

## Impact

- 5 new MCP tools registered in `src/server.ts`
- 5 new tool handler files in `src/tools/`
- 5 new OmniJS snippets in `src/snippets/`
- `ALLOWED_SNIPPETS` allowlist in `src/runtime/snippetLoader.ts` must be extended
- Integration tests will mutate real OmniFocus data (scoped to fixture folder per existing pattern)
