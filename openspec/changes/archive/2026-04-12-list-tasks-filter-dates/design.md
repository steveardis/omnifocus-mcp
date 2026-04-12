## Context

`TaskSummary` currently includes `dueDate` but not `deferDate` or `plannedDate`. The primary driver is scheduling migrations: Claude needs `deferDate` in list results to read the value and copy it to `plannedDate` in a single pass. Without it, the only option is an N+1 loop of `get_task` calls — slow and impractical for bulk operations.

## Goals / Non-Goals

**Goals:**
- Add `deferDate` and `plannedDate` to `TaskSummary` (additive, no breakage)
- Add `hasDeferDate: true` filter to `ListTasksFilter` so callers can retrieve only tasks with a defer date set
- Keep the snippet change minimal — these fields are already available on every OmniJS task object

**Non-Goals:**
- Adding `plannedBeforeDate` / `deferBeforeDate` date-range filters (can be added later; `hasDeferDate` covers the immediate use case)
- Changing `TaskDetail` (already has these fields)
- Adding filter support for `plannedDate` (no immediate use case identified)

## Decisions

**Decision: `hasDeferDate: true` boolean over `deferBeforeDate` date range**

`z.literal(true).optional()` matches the existing `flagged` filter pattern and directly addresses the use case ("find tasks with any defer date"). A date-range filter (`deferBeforeDate`) would also work but requires callers to supply a sentinel far-future date, which is awkward. The boolean is cleaner and consistent with how `flagged` works.

**Decision: Add both `deferDate` and `plannedDate` to `TaskSummary` together**

Even though only `deferDate` is needed for the immediate migration use case, `plannedDate` is equally natural to include at this point. Omitting it would mean a follow-up change when the next Forecast-style query surfaces the same gap.

## Risks / Trade-offs

- **Wider summary payload**: Each task in a list result carries two additional nullable datetime fields. Negligible in practice given OmniJS already fetches the full task object.
- **No `hasDeferDate` on OmniJS task**: The filter is implemented as a post-fetch JavaScript check (`task.deferDate !== null`) in the snippet — same pattern as all other filters.
