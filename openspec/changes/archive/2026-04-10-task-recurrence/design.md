## Context

OmniFocus tasks carry a `Task.RepetitionRule` which combines an ICS RRULE string with a `RepetitionMethod` enum (`Fixed`, `DueDate`, `Start`). The OmniJS API is:
- `task.repetitionRule = new Task.RepetitionRule(rruleString, method)` — set
- `task.repetitionRule = null` — clear
- `task.repetitionRule.ruleString` — read the RRULE back
- `task.repetitionRule.method` — read the method back

The OmniFocus UI exposes: frequency (daily/weekly/monthly/yearly), interval (every N units), days-of-week (weekly only), and repeat method (fixed interval / due date / completion date). This change targets exactly that surface.

## Goals / Non-Goals

**Goals:**
- `create_task`: accept optional `repetitionRule` to set recurrence at creation
- `edit_task`: accept optional `repetitionRule` (nullable to clear) on existing tasks
- `get_task` / `TaskDetail`: return current repetition as structured fields (or null)
- Validate that `daysOfWeek` is only meaningful on `frequency: "weekly"`

**Non-Goals:**
- RRULE patterns not reachable from the OmniFocus UI (e.g., "every 2nd Tuesday of the month", end-by-count, end-by-date)
- Project repetition (projects don't have `repetitionRule` in OmniJS)
- Raw RRULE escape hatch — scope is UI surface only

## Decisions

### Decision 1: Structured schema, no raw rrule

Input schema uses structured fields (`frequency`, `interval`, `daysOfWeek`, `method`). The snippet constructs the RRULE internally via `new Task.RepetitionRule(rruleString, methodEnum)`. This keeps the API LLM-friendly and prevents invalid RRULE strings from being passed in.

Considered: raw `{ rrule, method }` input. Rejected because LLMs may produce invalid RRULE syntax, and the UI surface is small enough to model fully without an escape hatch.

**OmniJS API notes (discovered empirically):**
- Constructor: `new Task.RepetitionRule(rrule, method)` — NOT `.make()`
- `Task.RepetitionMethod.Fixed` — fixed interval
- `Task.RepetitionMethod.DueDate` — repeat from due date
- `Task.RepetitionMethod.DeferUntilDate` — repeat from completion date (maps to our `"start"` method)
- Enum values have no `.name` property; use `String(enumValue)` which returns e.g. `"[object Task.RepetitionMethod: DeferUntilDate]"`

### Decision 2: RepetitionRuleInput is its own schema, embedded in CreateTaskInput and EditTaskInput

```
RepetitionRuleInput = z.object({
  frequency: z.enum(["daily", "weekly", "monthly", "yearly"]),
  interval: z.number().int().positive().default(1),
  daysOfWeek: z.array(z.enum(["sunday","monday","tuesday","wednesday","thursday","friday","saturday"])).optional(),
  method: z.enum(["fixed", "dueDate", "start"]),
})
.refine(d => !d.daysOfWeek || d.frequency === "weekly", {
  message: "daysOfWeek is only valid when frequency is 'weekly'"
})
```

In `EditTaskInput`: `repetitionRule: RepetitionRuleInput.nullable().optional()` — omit to leave unchanged, `null` to clear, object to set.

### Decision 3: Read side returns structured fields parsed from RRULE

`TaskDetail.repetitionRule` is `RepetitionRuleDetail | null`:
```
RepetitionRuleDetail = z.object({
  frequency: z.enum(["daily","weekly","monthly","yearly"]),
  interval: z.number(),
  daysOfWeek: z.array(...).optional(),
  method: z.enum(["fixed","dueDate","start"]),
})
```

The snippet parses `task.repetitionRule.ruleString` using simple regex/split to extract FREQ, INTERVAL, and BYDAY. If parsing fails (unsupported RRULE set outside the UI), return `{ rrule: rawString, method }` as a fallback with a `_raw: true` flag — this way the LLM sees something rather than crashing.

### Decision 4: RRULE construction in snippet, not TypeScript

Keeps the logic next to the OmniJS API call. TypeScript layer only validates the structured input and passes it through.

### Decision 5: daysOfWeek maps to BYDAY abbreviations

Day mapping: sunday→SU, monday→MO, tuesday→TU, wednesday→WE, thursday→TH, friday→FR, saturday→SA. When `daysOfWeek` is absent for a weekly rule, no `BYDAY` component is added (repeats on the same weekday as the task's due/defer date).

## Risks / Trade-offs

- **Tasks without a due or defer date + Fixed method**: OmniFocus behavior is undefined (no anchor date). Document in tool description; not validated by the schema.
- **RRULE parsing on read**: Simple regex parsing covers the UI surface; complex patterns set via OmniJS directly will hit the `_raw` fallback.
- **interval default**: Schema defaults `interval` to 1 but it must be passed explicitly in the RRULE string (`INTERVAL=1`) — OmniFocus requires it.
