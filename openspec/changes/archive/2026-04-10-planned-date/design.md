## Context

OmniFocus 4 distinguishes three date types on tasks: `deferDate` (hides until), `plannedDate` (Forecast target), and `dueDate` (hard deadline). The MCP server already handles defer and due with the pattern `isoOrNull(task.deferDate)` for reading and `task.deferDate = args.deferDate ? new Date(args.deferDate) : null` for writing. `plannedDate` follows the identical pattern — confirmed writable via OmniJS.

## Goals / Non-Goals

**Goals:**
- Add `plannedDate` to `create_task`, `edit_task`, `get_task`, and all snippets returning `TaskDetail`
- Follow the exact same pattern as `deferDate` and `dueDate`

**Non-Goals:**
- `effectiveDeferDate` / `effectiveDueDate` (computed fields inherited from projects — read-only, not actionable)
- Planned date on projects (projects don't have `plannedDate` in OmniJS)

## Decisions

### Decision 1: Same pattern as existing dates

`plannedDate` is added as `z.string().datetime().optional()` in `CreateTaskInput`, `z.string().datetime().nullable().optional()` in `EditTaskInput`, and `z.string().datetime().nullable()` in `TaskDetail`. No new abstractions needed.

### Decision 2: All TaskDetail-returning snippets updated

Five snippets return `TaskDetail`: `create_task`, `edit_task`, `get_task`, `complete_task`, `drop_task`. All five get `plannedDate: isoOrNull(task.plannedDate)` added to their return object.

## Risks / Trade-offs

- **Minimal risk** — purely additive, follows established patterns exactly. No behavioral change for existing callers.
