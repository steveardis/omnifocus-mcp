## Context

Claude Desktop cannot pass `null` for fields whose JSON Schema type is `anyOf: [{type: "string"}, {type: "null"}]`. This is the same root cause as the `repetitionRule` nullable bug fixed previously. The current `EditTaskInput` date fields use `z.string().datetime().nullable().optional()`, which Zod serializes to this broken `anyOf` form.

## Goals / Non-Goals

**Goals:**
- Allow callers to clear `deferDate`, `plannedDate`, and `dueDate` on an existing task via `edit_task`
- Follow the same pattern already established for `clearRepetitionRule`

**Non-Goals:**
- Changing how date fields work on `create_task` (setting dates, not clearing, works fine)
- Fixing `estimatedMinutes: null` — the same issue exists but is lower priority

## Decisions

**Decision: Explicit clear flags over nullable fields**

Add `clearDeferDate`, `clearPlannedDate`, `clearDueDate` as `z.literal(true).optional()` fields, and remove `.nullable()` from the corresponding date fields. Mirrors `clearRepetitionRule`.

Alternatives considered:
- Keep nullable, fix JSON Schema serialization in the MCP SDK layer — not feasible without forking the SDK
- Use a union type that produces a different JSON Schema shape — Zod has no way to produce `{"type": ["string", "null"]}` for `datetime()` fields; it always emits `anyOf`

**Decision: Clear flags are `literal(true)` not `boolean`**

Using `z.literal(true)` means the field can only be `true` — there's no ambiguity about what `false` means (leave unchanged vs. explicitly don't clear). Matches the existing `clearRepetitionRule` pattern.

## Risks / Trade-offs

- **API change**: Callers using `deferDate: null` will break. In practice this never worked (Claude Desktop couldn't pass null), so the real-world breakage is zero.
- **Verbosity**: Three new fields on `EditTaskInput`. Acceptable given the alternative is a broken API.

## Migration Plan

No migration needed — the previous null-based API was non-functional in Claude Desktop. The new clear flags work immediately after deploy.
