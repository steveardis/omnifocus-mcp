## Why

The bootstrap change delivered read-only tag access. Callers can read the tag hierarchy but cannot create new tags, rename existing ones, or delete them — blocking workflows that involve tagging tasks with tags that don't yet exist or maintaining the tag taxonomy.

## What Changes

- Add `create_tag` tool: create a top-level tag or a child tag nested under an existing tag
- Add `edit_tag` tool: rename a tag
- Add `delete_tag` tool: permanently delete a tag; tasks that held the tag have it removed (tool description instructs the AI to confirm with the user before invoking)

## Capabilities

### New Capabilities

- `tag-write`: Create, rename, and permanently delete OmniFocus tags

### Modified Capabilities

_(none — existing `tag-management` read requirements are unchanged)_

## Impact

- 3 new MCP tools registered in `src/server.ts`
- 3 new tool handler files in `src/tools/`
- 3 new OmniJS snippets in `src/snippets/`
- `ALLOWED_SNIPPETS` allowlist in `src/runtime/snippetLoader.ts` must be extended
- Deleting a tag with child tags also removes all descendants; tool description should note this
- Integration tests will mutate real OmniFocus data (scoped to fixture folder per existing pattern)
