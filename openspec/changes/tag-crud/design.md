## Context

Tags in OmniJS form a tree (parent/child nesting) and have a `status` property (`active`, `onHold`, `dropped`). Write operations are straightforward. Deleting a tag with child tags removes the entire subtree; tasks that held the tag have it automatically removed by OmniFocus.

OmniJS tag write operations:
- `new Tag(name)` — creates a top-level tag
- `new Tag(name, parentTag)` — creates a child tag nested under `parentTag`
- `tag.name = "..."` — rename
- `tag.status = Tag.Status.Active / OnHold / Dropped` — status transitions
- `deleteObject(tag)` — removes the tag; child tags and task associations are cleaned up by OmniFocus automatically (unlike folders/projects, no manual cascade needed)

## Goals / Non-Goals

**Goals:**
- Create top-level and child tags
- Rename tags and change their status
- Delete tags (OmniFocus handles the cascade automatically)

**Non-Goals:**
- Moving a tag to a different parent (separate `move-operations` change)

## Decisions

### Decision 1: `deleteObject(tag)` is safe without manual cascade

Unlike folders, `deleteObject(tag)` in OmniJS removes the tag, its child tags, and all task/project tag associations automatically. No recursive snippet logic is needed.

**Verification needed during implementation:** confirm child tags are removed and task associations are cleaned. If this proves incorrect, apply the folder recursive pattern.

### Decision 2: `edit_tag` exposes both `name` and `status`

Tags have a meaningful `status` (`active`, `onHold`, `dropped`) that users set intentionally. Unlike folder status (which is derived), tag status is directly writable and useful — e.g., putting a context tag on hold while travelling. Both `name` and `status` are optional fields in `edit_tag`.

### Decision 3: `create_tag` placement via optional `parentTagId`

- `parentTagId` omitted → top-level tag
- `parentTagId` provided → child tag nested under that tag

Same pattern as `create_folder` with `parentFolderId`.

## Risks / Trade-offs

- **Deleting a tag with many children** — automatic cascade by OmniFocus; no performance concern beyond normal `deleteObject` overhead.
- **`tag.status` enum values** — OmniJS uses `Tag.Status.Active`, `Tag.Status.OnHold`, `Tag.Status.Dropped`. Snippet must map input strings to the correct enum members.
- **Renaming a tag used in many tasks** — OmniFocus updates all associations automatically (tags are objects with stable IDs, not strings).
