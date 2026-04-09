## Context

Projects in OmniJS have more writable fields than tasks: type (`sequential`, `containsSingletonActions`), review interval, and folder placement. Status transitions use dedicated methods. This design follows the same patterns established in `task-crud`.

OmniJS project write operations:
- `new Project(name, position)` — creates a project; `position` is a `Folder` or omitted for top-level
- Property assignment for scalars: `name`, `note`, `flagged`, `deferDate`, `dueDate`, `sequential`, `containsSingletonActions`
- `project.status = Project.Status.Active / OnHold` — for hold/active transitions
- `project.markComplete()` — dedicated method for done
- `project.status = Project.Status.Dropped` — drops the project (`project.drop()` is not available via `evaluateJavascript`)
- `project.reviewInterval.steps = n` — only `steps` can be mutated in-place; `Project.ReviewInterval` is a CallbackObject in the `evaluateJavascript` context and cannot be constructed with `new`, so the unit cannot be changed and the interval cannot be cleared (OmniJS rejects `null`)
- Tags: `project.addTag(tag)` / `project.removeTag(tag)` — same pattern as tasks
- `deleteObject(project)` — permanent deletion including all tasks

## Goals / Non-Goals

**Goals:**
- Expose create, edit, complete, drop, and delete for projects
- Support folder placement on create (top-level or inside a folder)
- Edit any subset of fields in one call including review interval and type
- Replace-not-merge tag semantics (consistent with task-crud)

**Non-Goals:**
- Moving a project to a different folder (separate `move-operations` change)
- Creating tasks inside a new project in the same call (use `create_task` after)
- Recurrence rules (separate `recurrence` change)

## Decisions

### Decision 1: `type` mapped to OmniJS properties

Project type is not a single OmniJS property — it is encoded across two booleans:
- `sequential: true` → `"sequential"`
- `containsSingletonActions: true` → `"singleActions"`
- both false → `"parallel"`

`create_project` and `edit_project` accept the enum string `"parallel" | "sequential" | "singleActions"` and the snippet maps it to the correct property assignments.

### Decision 2: `reviewInterval` — steps only, in-place mutation

`edit_project` and `create_project` accept `reviewInterval` as `{steps: number, unit: "days" | "weeks" | "months" | "years"}`. Only the `steps` field can actually be applied: `project.reviewInterval.steps = n` mutates the existing interval in place.

**Limitations discovered during implementation:** `Project.ReviewInterval` is a CallbackObject in the `evaluateJavascript` context — `new Project.ReviewInterval(steps, unit)` throws. `Project.ReviewInterval.Unit` is also undefined in this context, so the unit cannot be changed. Setting `project.reviewInterval = null` is rejected by OmniJS ("must be set to a non-null value"). As a result, the `unit` field in `reviewInterval` input is accepted by the schema but silently ignored at runtime.

**Note:** Read output (`get_project`) returns the string form `"1 weeks"` — that is a read-side concern unchanged by this limitation.

### Decision 3: Status transitions via dedicated tools and property assignment

`complete_project` calls `markComplete()`. `drop_project` sets `project.status = Project.Status.Dropped` — `project.drop()` does not exist in the `evaluateJavascript` context. Active/on-hold are set via `project.status = Project.Status.Active / OnHold` inside `edit_project` (these are property assignments, not method calls). This keeps the common "put on hold" operation accessible through `edit_project` without requiring a dedicated tool.

### Decision 4: `delete_project` description warns about task cascade

`deleteObject(project)` removes the project and all its tasks. The tool description explicitly states this. Consistent with `delete_task` and `delete_folder` confirmation pattern.

## Risks / Trade-offs

- **`new Project(name)` without a position** creates a top-level project. Verified in OmniJS.
- **`new Project(name, folder)` with a Folder object** places the project inside that folder.
- **Review interval unit enum values** — OmniJS `Project.ReviewInterval.Unit` has `.days`, `.weeks`, `.months`, `.years`. Snippet should map string to the enum member, not pass the string directly.
- **Changing type from `singleActions`** may silently fail if the project has tasks structured for that mode — low risk for typical usage, not worth guarding against in v1.
