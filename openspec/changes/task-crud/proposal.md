## Why

The bootstrap change delivered read-only task access. Callers can observe tasks but cannot create, modify, complete, drop, or delete them — making the server unsuitable for any workflow that involves acting on tasks, not just reading them.

## What Changes

- Add `create_task` tool: create a task in a project, as a subtask, or in the inbox
- Add `edit_task` tool: modify any subset of a task's scalar fields and tag assignments in a single call
- Add `complete_task` tool: mark a task complete
- Add `drop_task` tool: mark a task dropped
- Add `delete_task` tool: permanently delete a task (tool description instructs the AI to confirm with the user before invoking)

## Capabilities

### New Capabilities

- `task-write`: Create, edit, complete, drop, and permanently delete OmniFocus tasks

### Modified Capabilities

- `task-management`: Extend existing spec to add write requirements alongside the existing read requirements

## Impact

- 5 new MCP tools registered in `src/server.ts`
- 5 new tool handler files in `src/tools/`
- 5 new OmniJS snippets in `src/snippets/`
- `ALLOWED_SNIPPETS` allowlist in `src/runtime/snippetLoader.ts` must be extended
- Integration tests will mutate real OmniFocus data (scoped to fixture folder per existing pattern)
