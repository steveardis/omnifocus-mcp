## Context

`list_folders` and `list_tags` are the last two list tools without filtering or limit support. The pattern established by `list_tasks` and `list_projects` — filter inside the OmniJS snippet, expose filter object and limit from the TypeScript handler — applies directly.

Unlike tasks and projects, there is no universally agreed "terminal" status for folders (dropped folders are unusual but valid to show) or tags (onHold tags are actively used). Therefore the default behavior includes all statuses; filtering is opt-in.

## Goals / Non-Goals

**Goals:**
- `list_folders`: add `limit` (default 200) and optional `status` filter (`active` | `dropped`)
- `list_tags`: add `limit` (default 200) and optional `status` filter (`active` | `onHold` | `dropped`)

**Non-Goals:**
- `parentId` / subtree scoping for folders or tags (flat list is sufficient in practice)
- Filtering by name or path pattern
- Pagination

## Decisions

### Decision 1: No default status exclusion

Unlike `list_tasks` and `list_projects`, the default returns all statuses. Dropped folders/tags are uncommon enough that including them doesn't overwhelm results, and an LLM may need to see them. Callers can pass `status: ["active"]` to filter.

### Decision 2: Single status value, not array

For `list_folders` and `list_tags`, a single `status` string (not an array) is sufficient — users rarely need "active OR onHold" for tags. Simpler API. If multi-status becomes needed, it's a non-breaking addition later.

### Decision 3: Limit default 200

Folders and tags are fewer than tasks; 200 is generous. Consistent with the spirit of existing defaults (tasks: 200, projects: 100).

### Decision 4: Same filter-in-snippet pattern

All filtering in the OmniJS snippet before data crosses the JXA bridge. TypeScript layer validates and passes through. Consistent with list_tasks and list_projects.

## Risks / Trade-offs

- **Minimal risk** — purely additive. Existing callers passing no args get all items (same as before but now capped at 200, which is a minor behavior change). Acceptable.
