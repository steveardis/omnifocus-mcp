# recurrence

## Purpose

Covers the construction, assignment, reading, and clearing of `Task.RepetitionRule` values on OmniFocus tasks.

## Requirements

### Requirement: Capability declared

The `recurrence` capability SHALL cover the construction, assignment, reading, and clearing of `Task.RepetitionRule` values on OmniFocus tasks. The capability SHALL expose a structured schema matching the OmniFocus UI surface: `frequency` (`daily` | `weekly` | `monthly` | `yearly`), `interval` (every N units, ≥1), `daysOfWeek` (weekly only, any subset of the 7 days), and `method` (`fixed` | `dueDate` | `start`). Repetition SHALL be set and cleared through `create_task` and `edit_task`, and the current rule SHALL be returned by `get_task` as structured fields parsed from the underlying RRULE. Raw RRULE strings SHALL NOT be accepted as input; all recurrence SHALL be expressed through the structured schema.

#### Scenario: Capability is named and scoped
- **WHEN** a change proposes adding or modifying recurrence-related behavior
- **THEN** it lands requirements under this capability

### Requirement: Set repetition rule on task

The system SHALL accept a `repetitionRule` field in `create_task` and `edit_task`. When provided, the snippet SHALL construct an ICS RRULE string from the structured fields and assign it via `new Task.RepetitionRule(rrule, method)`. The `daysOfWeek` field SHALL only be valid when `frequency` is `"weekly"`; providing it for any other frequency SHALL be a validation error. When `edit_task` receives `repetitionRule: null`, the snippet SHALL assign `task.repetitionRule = null` to clear the rule. When `edit_task` omits `repetitionRule` entirely, the existing rule SHALL be left unchanged.

#### Scenario: Set daily repetition at creation
- **WHEN** `create_task` is called with `{ name: "Stand-up", repetitionRule: { frequency: "daily", interval: 1, method: "fixed" } }`
- **THEN** the created task has a repetition rule of every day (fixed interval) and the returned TaskDetail includes the parsed repetitionRule

#### Scenario: Set weekly repetition on specific days
- **WHEN** `create_task` is called with `{ repetitionRule: { frequency: "weekly", interval: 1, daysOfWeek: ["monday", "wednesday", "friday"], method: "start" } }`
- **THEN** the task repeats every Mon/Wed/Fri from completion date

#### Scenario: Edit task to add repetition
- **WHEN** `edit_task` is called with `{ id: "t1", repetitionRule: { frequency: "monthly", interval: 1, method: "dueDate" } }`
- **THEN** the task's repetition rule is set to monthly (due date) and all other fields are unchanged

#### Scenario: Clear repetition via null
- **WHEN** `edit_task` is called with `{ id: "t1", repetitionRule: null }`
- **THEN** the task's repetition rule is cleared and `get_task` returns `repetitionRule: null` for that task

#### Scenario: daysOfWeek on non-weekly frequency is a validation error
- **WHEN** `create_task` or `edit_task` is called with `{ repetitionRule: { frequency: "daily", daysOfWeek: ["monday"], method: "fixed" } }`
- **THEN** the tool returns a validation error before any snippet executes

### Requirement: Return repetition rule from get_task

The system SHALL include a `repetitionRule` field in the `TaskDetail` returned by `get_task`. When a task has no repetition rule, the field SHALL be `null`. When a task has a rule, the field SHALL be a structured object with `frequency`, `interval`, `daysOfWeek` (omitted when not applicable), and `method`, parsed from the underlying RRULE and RepetitionMethod.

#### Scenario: get_task returns null when no repetition set
- **WHEN** `get_task` is called for a task with no repetition rule
- **THEN** the returned TaskDetail includes `repetitionRule: null`

#### Scenario: get_task returns structured repetition fields
- **WHEN** `get_task` is called for a task with a weekly repetition rule
- **THEN** the returned TaskDetail includes `repetitionRule` with `frequency: "weekly"`, correct `interval`, `daysOfWeek` array, and `method`
