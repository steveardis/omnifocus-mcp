# Spec: Project Write

## Purpose

Provides MCP tools for creating and mutating OmniFocus projects: creating new projects, editing project properties, marking projects complete or dropped, and permanently deleting projects.

## Requirements

### Requirement: Create project

The system SHALL provide a `create_project` tool that creates a new OmniFocus project and returns its full detail record. The tool SHALL accept `{name: string, folderId?: string, note?: string, type?: "parallel" | "sequential" | "singleActions", status?: "active" | "onHold", flagged?: boolean, deferDate?: string, dueDate?: string, reviewInterval?: {steps: number, unit: "days" | "weeks" | "months" | "years"}, tagIds?: string[]}`. If `folderId` is provided the project SHALL be created inside that folder; otherwise it SHALL be created at the top level.

#### Scenario: Create top-level project
- **WHEN** `create_project` is called with `{name: "My Project"}` and no `folderId`
- **THEN** the tool creates the project at the top level and returns its full detail record including a stable `id`

#### Scenario: Create project inside a folder
- **WHEN** `create_project` is called with `{name: "My Project", folderId: "abc123"}`
- **THEN** the tool creates the project inside the specified folder and returns its full detail record with `folderPath` reflecting the folder

#### Scenario: Create sequential project
- **WHEN** `create_project` is called with `{name: "My Project", type: "sequential"}`
- **THEN** the returned project detail includes `type: "sequential"`

#### Scenario: Non-existent folder returns not-found error
- **WHEN** `create_project` is called with a `folderId` that does not correspond to any folder
- **THEN** the tool returns a structured not-found error

### Requirement: Edit project

The system SHALL provide an `edit_project` tool that modifies an existing project and returns its updated full detail record. The tool SHALL accept `{id: string}` plus any subset of `{name?: string, note?: string, type?: "parallel" | "sequential" | "singleActions", status?: "active" | "onHold", flagged?: boolean, deferDate?: string | null, dueDate?: string | null, reviewInterval?: {steps: number, unit: "days" | "weeks" | "months" | "years"}, tagIds?: string[]}`. Fields omitted from the call SHALL be left unchanged. When `tagIds` is provided it SHALL replace the project's entire tag set. Passing `null` for a date SHALL clear the field. When `reviewInterval` is provided, only the `steps` value is updated; the `unit` field is accepted by the schema but cannot be changed at runtime due to OmniJS API constraints in the `evaluateJavascript` context.

#### Scenario: Put project on hold
- **WHEN** `edit_project` is called with `{id: "abc123", status: "onHold"}`
- **THEN** the project's status becomes `"onHold"` and all other fields are unchanged

#### Scenario: Set review interval
- **WHEN** `edit_project` is called with `{id: "abc123", reviewInterval: {steps: 2, unit: "weeks"}}`
- **THEN** the project's review interval is updated and the returned detail reflects the change

#### Scenario: Non-existent project returns not-found error
- **WHEN** `edit_project` is called with an ID that does not correspond to any project
- **THEN** the tool returns a structured not-found error

### Requirement: Complete project

The system SHALL provide a `complete_project` tool that marks an existing project done using OmniJS `markComplete()` and returns the project's updated full detail record.

#### Scenario: Complete an existing project
- **WHEN** `complete_project` is called with the ID of an active project
- **THEN** the project's status becomes `"done"` and the tool returns the updated detail record

#### Scenario: Non-existent project returns not-found error
- **WHEN** `complete_project` is called with an ID that does not correspond to any project
- **THEN** the tool returns a structured not-found error

### Requirement: Drop project

The system SHALL provide a `drop_project` tool that marks an existing project dropped using OmniJS `drop()` and returns the project's updated full detail record.

#### Scenario: Drop an existing project
- **WHEN** `drop_project` is called with the ID of an active project
- **THEN** the project's status becomes `"dropped"` and the tool returns the updated detail record

#### Scenario: Non-existent project returns not-found error
- **WHEN** `drop_project` is called with an ID that does not correspond to any project
- **THEN** the tool returns a structured not-found error

### Requirement: Delete project

The system SHALL provide a `delete_project` tool that permanently deletes a project and all its tasks using OmniJS `deleteObject()`. The tool description SHALL instruct the AI to confirm with the user before invoking this tool, noting that deletion is permanent and removes all tasks within the project.

#### Scenario: Delete an existing project
- **WHEN** `delete_project` is called with the ID of an existing project
- **THEN** the project and all its tasks are permanently removed from OmniFocus and the tool returns a confirmation envelope

#### Scenario: Non-existent project returns not-found error
- **WHEN** `delete_project` is called with an ID that does not correspond to any project
- **THEN** the tool returns a structured not-found error
