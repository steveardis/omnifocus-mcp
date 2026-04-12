## MODIFIED Requirements

### Requirement: Edit task

The system SHALL provide an `edit_task` tool that modifies an existing task and returns its updated full detail record. The tool SHALL accept `{id: string}` plus any subset of `{name?: string, note?: string, flagged?: boolean, deferDate?: string, plannedDate?: string, dueDate?: string, clearDeferDate?: true, clearPlannedDate?: true, clearDueDate?: true, estimatedMinutes?: number | null, tagIds?: string[], repetitionRule?: RepetitionRuleInput, clearRepetitionRule?: true}`. Fields omitted from the call SHALL be left unchanged. When `tagIds` is provided it SHALL replace the task's entire tag set; when omitted, tags SHALL be unchanged. To clear a date field, the caller SHALL pass the corresponding clear flag (`clearDeferDate: true`, `clearPlannedDate: true`, or `clearDueDate: true`); passing a date string SHALL set the field; omitting both SHALL leave the field unchanged. Passing `clearRepetitionRule: true` SHALL clear the task's recurrence; passing a `RepetitionRuleInput` object SHALL set or replace the recurrence; omitting both SHALL leave the existing recurrence unchanged.

#### Scenario: Edit a single field
- **WHEN** `edit_task` is called with `{id: "abc123", flagged: true}`
- **THEN** only the `flagged` field is changed; all other fields retain their previous values

#### Scenario: Replace tag set
- **WHEN** `edit_task` is called with `{id: "abc123", tagIds: ["t1", "t2"]}`
- **THEN** the task's tags are set to exactly `["t1", "t2"]`, replacing any previously assigned tags

#### Scenario: Clear due date
- **WHEN** `edit_task` is called with `{id: "abc123", clearDueDate: true}`
- **THEN** the task's due date is cleared

#### Scenario: Clear defer date
- **WHEN** `edit_task` is called with `{id: "abc123", clearDeferDate: true}`
- **THEN** the task's defer date is cleared

#### Scenario: Clear planned date
- **WHEN** `edit_task` is called with `{id: "abc123", clearPlannedDate: true}`
- **THEN** the task's planned date is cleared

#### Scenario: Non-existent task returns not-found error
- **WHEN** `edit_task` is called with an ID that does not correspond to any task
- **THEN** the tool returns a structured not-found error

#### Scenario: Non-existent tag ID returns not-found error
- **WHEN** `edit_task` is called with a `tagIds` array containing an ID that does not correspond to any tag
- **THEN** the tool returns a structured not-found error and the task is not modified

#### Scenario: Set repetition via edit
- **WHEN** `edit_task` is called with `{ id: "t1", repetitionRule: { frequency: "monthly", interval: 1, method: "dueDate" } }`
- **THEN** the task's recurrence is set and all other fields are unchanged

#### Scenario: Clear repetition via edit
- **WHEN** `edit_task` is called with `{ id: "t1", clearRepetitionRule: true }`
- **THEN** the task's recurrence is cleared and all other fields are unchanged
