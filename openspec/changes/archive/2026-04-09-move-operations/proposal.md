## Why

There is no way to move a task to a different project or make it a subtask, and no way to move a project to a different folder. These are common reorganization actions in OmniFocus that an LLM assistant should be able to perform on the user's behalf.

## What Changes

- Add `move_task` tool: moves a task to a project (top-level) or makes it a subtask of another task
- Add `move_project` tool: moves a project to a folder or to the top level

## Capabilities

### New Capabilities

- `move-operations`: moving tasks between projects/parents and moving projects between folders

### Modified Capabilities

_(none — new tools, no existing requirement changes)_

## Impact

- `src/snippets/move_task.js`, `src/snippets/move_project.js`: new OmniJS snippets
- `src/tools/moveTask.ts`, `src/tools/moveProject.ts`: new tool handlers
- `src/tools/index.ts`: register new tools
- `src/runtime/snippetLoader.ts`: allowlist new snippet names
