## Context

`list_tasks` currently fetches all tasks in scope and returns a flat `TaskSummary` array with no server-side filtering. For large databases, `scope: { all: true }` can return thousands of tasks — far too many for an LLM to reason over. Filtering must happen inside the OmniJS snippet before data crosses the JXA bridge; post-hoc filtering in TypeScript would still pay the full serialization cost.

`TaskSummary` currently omits `dueDate` and `tagIds`. Without these, filtered results are opaque: if the LLM asks "what's due today?" it can't present due dates in its response without issuing a `get_task` call per result.

## Goals / Non-Goals

**Goals:**
- Filter tasks by `flagged`, `status[]`, `tagId`, and `dueBeforeDate` inside the snippet
- Enrich `TaskSummary` with `dueDate` and `tagIds`
- Change default behavior: exclude `complete` and `dropped` tasks when no `status` filter is provided
- Cap results with a configurable `limit` (default 200)

**Non-Goals:**
- Multi-tag filtering with AND/OR semantics (future work)
- Full-text search on task name or note
- Pagination / cursor-based continuation (hard cap only)
- Filtering `list_projects` (separate change)

## Decisions

### Decision 1: Filter in snippet, not TypeScript

All filter logic runs inside `evaluateJavascript`. The TypeScript layer passes filter args through and validates the schema. This avoids deserializing thousands of tasks only to discard most of them.

Alternative considered: filter in TS. Rejected because the JXA serialization cost is paid per-task regardless — a 5000-task DB would serialize all 5000 even if only 10 match.

### Decision 2: Enrich TaskSummary with dueDate and tagIds

`TaskSummary` gains two fields:
- `dueDate: string | null` — ISO datetime
- `tagIds: string[]`

These are the fields most likely to appear in filtering queries and most useful to display in results. Other detail fields (`note`, `deferDate`, `estimatedMinutes`) remain in `TaskDetail` only.

This is a non-breaking addition to the shape — existing consumers receive new optional fields.

### Decision 3: Default excludes complete and dropped

When `filter.status` is omitted, the snippet filters out `Task.Status.Completed` and `Task.Status.Dropped`. This is a breaking behavior change but the correct default for LLM-driven queries. The previous default (return everything) was only useful for bulk inspection, which can still be achieved with `status: ["available", "blocked", "dueSoon", "next", "overdue", "complete", "dropped"]`.

### Decision 4: Status filter as array, tag filter as single ID

`status` accepts an array of `TaskStatus` values. This lets callers express compound queries ("available OR overdue") in a single call.

`tagId` accepts a single ID — the 80% use case. Multi-tag AND/OR filtering adds significant complexity for uncertain benefit in v1.

### Decision 5: dueBeforeDate is inclusive

`dueBeforeDate` matches tasks where `task.dueDate <= dueBeforeDate`. "Due before end of today" is expressed as the end-of-day ISO timestamp. Null due dates never match.

### Decision 6: limit default 200, passed as snippet arg

The limit is enforced inside the snippet (slice after filtering) so the cap applies before serialization. Default 200. Callers may increase it up to any value — there is no server-side maximum, just the JXA timeout.

## Risks / Trade-offs

- **Breaking default behavior** — consumers that relied on `list_tasks` returning complete tasks will see a behavior change. Risk is low: this is a local MCP server with a single consumer (Claude Desktop), and the new default is strictly more useful.
- **tagId filter requires flattenedTags lookup** — to check `task.tags`, OmniJS traverses the tag tree. On databases with thousands of tags this is fast in practice but not free.
- **limit does not paginate** — if a user has 500 overdue tasks and limit is 200, they see the first 200 with no way to retrieve the rest. Acceptable for v1; pagination is future work.
