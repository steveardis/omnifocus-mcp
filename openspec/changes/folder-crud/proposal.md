## Why

The bootstrap change delivered read-only folder access. Callers can traverse the folder hierarchy but cannot create, rename, or delete folders — blocking any workflow that involves organizing projects into folders.

## What Changes

- Add `create_folder` tool: create a folder at the top level or nested inside an existing folder
- Add `edit_folder` tool: rename a folder
- Add `delete_folder` tool: permanently delete a folder and all its contents — projects, tasks, and child folders (tool description instructs the AI to confirm with the user before invoking and calls out the destructive cascade)

## Capabilities

### New Capabilities

- `folder-write`: Create, rename, and permanently delete OmniFocus folders

### Modified Capabilities

_(none — existing `folder-management` read requirements are unchanged)_

## Impact

- 3 new MCP tools registered in `src/server.ts`
- 3 new tool handler files in `src/tools/`
- 3 new OmniJS snippets in `src/snippets/`
- `ALLOWED_SNIPPETS` allowlist in `src/runtime/snippetLoader.ts` must be extended
- Integration tests will mutate real OmniFocus data (scoped to fixture folder per existing pattern)
- `delete_folder` is the most destructive single operation in the server — the tool description warrants an explicit warning that the entire subtree (child folders, projects, and all tasks) is permanently removed
