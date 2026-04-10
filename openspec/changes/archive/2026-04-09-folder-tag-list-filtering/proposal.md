## Why

`list_folders` and `list_tags` return all items with no way to cap results or filter by status. While folders and tags are typically fewer than tasks or projects, users with large databases may have hundreds of tags (including dropped ones). Adding `limit` and optional `status` filtering completes the filtering pattern applied to `list_tasks` and `list_projects`.

## What Changes

- Add `limit` parameter to `list_folders` (default 200)
- Add `status` filter to `list_folders`: when provided, restrict to folders with that status (`active` or `dropped`); when omitted, return all folders
- Add `limit` parameter to `list_tags` (default 200)
- Add `status` filter to `list_tags`: when provided, restrict to tags with that status (`active`, `onHold`, or `dropped`); when omitted, return all tags
- All filtering happens inside the OmniJS snippet

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `folder-management`: `list_folders` gains `limit` and optional `status` filter
- `tag-management`: `list_tags` gains `limit` and optional `status` filter

## Impact

- `src/schemas/shapes.ts`: add `ListFoldersFilter` and `ListTagsFilter` schemas
- `src/schemas/index.ts`: export new filter schemas
- `src/snippets/list_folders.js`, `list_tags.js`: add filter + limit logic
- `src/tools/listFolders.ts`, `listTags.ts`: add filter + limit params
- Unit and integration tests for both tools
