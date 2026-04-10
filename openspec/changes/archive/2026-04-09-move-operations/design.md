## Context

OmniFocus supports moving tasks between containers (projects or parent tasks) and moving projects between folders via the `moveSections` and `append`/`prepend` OmniJS APIs. Currently no MCP tool exposes this capability.

The OmniJS API for moving: `moveTasks([task], destination)` where destination is a `Project` or `Task`. For projects: `moveProjects([project], folder)` where folder is a `Folder` or `null` for top-level. Direct property assignment (`task.containingProject`, `project.parentFolder`) is read-only and does not work.

## Goals / Non-Goals

**Goals:**
- `move_task`: move a task to a project (top-level) or make it a subtask of another task
- `move_project`: move a project to a folder or to the top level

**Non-Goals:**
- Moving folders (rename/reparent of folders — separate concern)
- Reordering within a container (OmniJS exposes position but it's complex)
- Moving tags

## Decisions

### Decision 1: move_task requires exactly one destination

`move_task` accepts `{ id, projectId?, parentTaskId? }`. Exactly one of `projectId` or `parentTaskId` must be provided — enforced by Zod `.refine()` at the TypeScript boundary and validated again in the snippet. Returns the updated task summary.

### Decision 2: Moving to a project places task at end of project's task list

OmniJS `task.containingProject = project` places the task at the end. This is the natural default; no position parameter needed.

### Decision 3: move_project accepts folderId as string or null

`null` means move to top level (no parent folder). OmniJS: `project.parentFolder = null` removes the folder assignment.

### Decision 4: Not-found errors for all ID lookups

Same pattern as existing write tools: `NotFoundError` if task, project, folder, or parentTask ID is not found. Snippet throws; bridge catches and wraps as `ExecutionError`.

### Decision 5: Return updated summary, not full detail

`move_task` returns a `TaskSummary`. `move_project` returns a `ProjectSummary`. Consistent with create/edit patterns.

## Risks / Trade-offs

- **OmniJS assignment semantics** — setting `task.containingProject` may behave differently than `task.parentTask`. Both need integration testing to verify the task ends up in the right place.
- **Inbox tasks** — moving an inbox task to a project is valid and expected to work. Moving a project task to inbox is not supported (OmniJS doesn't expose inbox assignment on tasks directly). Document this limitation.
