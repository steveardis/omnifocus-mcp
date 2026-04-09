## Context

The bootstrap change established the JXA→OmniJS bridge, snippet pattern, and result protocol. All five write tools follow those same patterns. The key question for writes is: what does OmniJS expose for creating and mutating tasks, and what are the edge cases?

OmniJS task write operations:
- `new Task(name, position)` — creates a task; `position` is a `Project` or `Task` (for subtasks)
- `task.name = "..."` — property assignment for most scalar fields
- `task.markComplete()` — dedicated method (not property assignment)
- `task.drop()` — dedicated method
- `deleteObject(task)` — permanent deletion
- Tags: `task.addTag(tag)` / `task.removeTag(tag)` — manipulate by Tag object, not ID

## Goals / Non-Goals

**Goals:**
- Expose create, edit, complete, drop, and delete for tasks
- Support inbox tasks (no project), project tasks, and subtasks
- Edit any subset of fields in one call (fat edit — no single-field tools)
- Permanently delete with a tool description that instructs the AI to confirm before invoking

**Non-Goals:**
- Moving tasks between projects/containers (separate `move-operations` change)
- Recurrence rules (separate `recurrence` change)
- Batch operations (separate change)

## Decisions

### Decision 1: Tag manipulation by ID, resolved inside the snippet

Tags are assigned via `task.addTag(tagObject)` / `task.removeTag(tagObject)`, which require a live `Tag` object. The snippet will receive tag IDs and resolve them via `flattenedTags.find(t => t.id.primaryKey === id)` inline. This keeps the bridge contract clean (IDs only) without requiring a separate resolution round-trip.

**Alternative considered:** Accept tag names. Rejected — names are ambiguous; IDs are stable.

### Decision 2: `edit_task` replaces tags, not merges

When `tagIds` is provided to `edit_task`, the snippet replaces the task's full tag set (remove all, add new). When `tagIds` is omitted, tags are untouched. This is the least surprising contract: callers who want to add one tag still need to pass the full desired set, but they can read it from `get_task` first.

**Alternative considered:** Separate `add_tags` / `remove_tags` fields. Rejected — more surface area with no material benefit given that `get_task` is cheap.

### Decision 3: `create_task` placement via optional `projectId` and `parentTaskId`

- Both omitted → inbox
- `projectId` only → task added to project root
- `parentTaskId` only → subtask; inherits project from parent
- Both provided → error (ambiguous placement; caller must choose)

This mirrors how OmniFocus itself treats task placement.

### Decision 4: `complete_task` and `drop_task` as separate tools from `edit_task`

Status transitions in OmniJS require method calls (`markComplete()`, `drop()`), not property assignment. Exposing them as dedicated tools makes the intent unambiguous and avoids a complex status-to-method dispatch inside `edit_task`. It also makes tool descriptions cleaner for the LLM.

### Decision 5: `delete_task` tool description as the confirmation guardrail

The server executes `deleteObject(task)` unconditionally when called. The confirmation requirement is enforced through the MCP tool description, which instructs the AI to ask the user explicitly before invoking this tool. This is consistent with how MCP tool descriptions guide AI behavior.

## Risks / Trade-offs

- **Partial edit with bad field value** → OmniJS will throw; the error envelope propagates back as an `ExecutionError`. No partial writes occur because OmniJS is synchronous within `evaluateJavascript`.
- **Tag ID not found during edit** → Snippet should throw a descriptive `NotFoundError` for the missing tag ID, not silently skip it.
- **Inbox placement** → `new Task(name, inbox)` requires passing the `inbox` object. In OmniJS the inbox is accessible as `inbox` (bare global). Verified pattern from the read-side exploration.
- **deleteObject on a task with subtasks** → OmniJS deletes the task and all subtasks. Tool description should note this.
