## Context

Projects in OmniJS have more writable fields than tasks: type (`sequential`, `containsSingletonActions`), review interval, and folder placement. Status transitions use dedicated methods. This design follows the same patterns established in `task-crud`.

OmniJS project write operations:
- `new Project(name, position)` — creates a project; `position` is a `Folder` or omitted for top-level
- Property assignment for scalars: `name`, `note`, `flagged`, `deferDate`, `dueDate`, `sequential`, `containsSingletonActions`
- `project.status = Project.Status.Active / OnHold` — for hold/active transitions
- `project.markComplete()` — dedicated method for done
- `project.drop()` — dedicated method for dropped
- `project.reviewInterval = new Project.ReviewInterval(steps, unit)` — structured assignment
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

### Decision 2: `reviewInterval` as structured input

`edit_project` accepts `reviewInterval` as `{steps: number, unit: "days" | "weeks" | "months" | "years"} | null`. The snippet constructs `new Project.ReviewInterval(steps, unit)` and assigns it. Passing `null` clears the review interval. This avoids the ambiguous `"1 weeks"` string format used in read output (which was a workaround for `String(ri)` returning `[object Project.ReviewInterval]`).

**Note:** Read output (`get_project`) still returns the string form `"1 weeks"` — that is a read-side concern. The write side takes a structured object.

### Decision 3: Status transitions via dedicated tools

`complete_project` calls `markComplete()`, `drop_project` calls `drop()`. Active/on-hold are set via `project.status = Project.Status.Active / OnHold` inside `edit_project` (these are property assignments, not method calls). This keeps the common "put on hold" operation accessible through `edit_project` without requiring a dedicated tool.

### Decision 4: `delete_project` description warns about task cascade

`deleteObject(project)` removes the project and all its tasks. The tool description explicitly states this. Consistent with `delete_task` and `delete_folder` confirmation pattern.

## Risks / Trade-offs

- **`new Project(name)` without a position** creates a top-level project. Verified in OmniJS.
- **`new Project(name, folder)` with a Folder object** places the project inside that folder.
- **Review interval unit enum values** — OmniJS `Project.ReviewInterval.Unit` has `.days`, `.weeks`, `.months`, `.years`. Snippet should map string to the enum member, not pass the string directly.
- **Changing type from `singleActions`** may silently fail if the project has tasks structured for that mode — low risk for typical usage, not worth guarding against in v1.
