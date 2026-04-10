## Context

`list_projects` currently fetches all projects and returns a flat `ProjectSummary` array with no filtering. This mirrors the pre-filtering state of `list_tasks`. The task-filtering change established the pattern: filter inside the OmniJS snippet before data crosses the JXA bridge, enrich the summary shape with fields needed for filtering and display, change the default to exclude terminal statuses.

`ProjectSummary` currently omits `flagged` and the parent folder ID (it has `folderPath` string but not `folderId`). Without `folderId`, the LLM cannot cross-reference a listed project with a known folder ID, and cannot filter by folder ID from returned results.

## Goals / Non-Goals

**Goals:**
- Filter projects by `status[]`, `folderId` (recursive subtree), and `flagged` inside the snippet
- Enrich `ProjectSummary` with `flagged` and `folderId`
- Change default behavior: exclude `done` and `dropped` projects when no `status` filter is provided
- Cap results with a configurable `limit` (default 100)

**Non-Goals:**
- Filtering by tag, due date, or review date (can be added later)
- Filtering `list_folders` or `list_tags` (separate changes if needed)
- Pagination / cursor-based continuation

## Decisions

### Decision 1: Same pattern as task-filtering — filter in snippet

All filter logic runs inside `evaluateJavascript`. The TypeScript layer validates the schema and passes filter args through. Consistent with task-filtering; avoids any future performance concerns if project counts grow.

### Decision 2: Enrich ProjectSummary with flagged and folderId

`ProjectSummary` gains:
- `flagged: boolean` — needed to support the `flagged` filter and display flagged state in results
- `folderId: string | null` — the direct parent folder's `id.primaryKey`, or `null` for top-level projects

`folderPath` is kept as-is (useful for display). `folderId` is added alongside it as the machine-readable reference. No other detail fields are promoted to the summary.

### Decision 3: Default excludes done and dropped

When `filter.status` is omitted, the snippet excludes `Project.Status.Done` and `Project.Status.Dropped`. This mirrors the task-filtering default and is the correct behavior for LLM planning queries. Done/dropped projects can be retrieved explicitly with `status: ["done"]` or `status: ["dropped"]`.

### Decision 4: folderId filter is recursive

When `filter.folderId` is provided, the snippet returns projects whose parent folder chain includes the specified folder ID — i.e., direct children and all nested descendants. This is consistent with how `list_tasks` treats `scope.folderId`.

Implementation: check `p.flattenedProjects` on the resolved folder rather than walking `flattenedProjects` globally and checking ancestry. More efficient and correct.

### Decision 5: limit default 100

Projects are fewer than tasks; 100 is a sensible default. Callers may increase it.

## Risks / Trade-offs

- **Breaking default behavior** — same risk as task-filtering. Acceptable: single consumer, new default is strictly more useful.
- **folderId recursive filter uses folder.flattenedProjects** — this is the cleanest OmniJS approach. If the folder ID is invalid, return an empty array (not an error) since this is a filter, not a scope requirement. Actually: throw NotFoundError to be consistent with list_tasks scope behavior.
- **flagged on ProjectSummary is a new required field** — any existing unit test fixtures for ProjectSummary will need updating (same situation as TaskSummary in task-filtering).
