## Context

Folders in OmniJS are simpler than tasks or projects — they have only `name` and `status` as meaningful writable properties, and they nest via parent/child relationships. The main complexity is deletion: `deleteObject(folder)` leaves an empty shell (as discovered during bootstrap integration testing); the snippet must recursively delete contents first.

OmniJS folder write operations:
- `new Folder(name)` — creates a top-level folder (auto-inserted at root)
- `new Folder(name, folderObject)` — creates a nested folder inside `folderObject`
- `folder.name = "..."` — rename
- `deleteObject(folder)` — removes folder shell but NOT contents; must delete contents first
- Recursive deletion pattern (established in bootstrap fixtures): delete all projects in folder, recurse child folders, then delete the folder itself

## Goals / Non-Goals

**Goals:**
- Create top-level and nested folders
- Rename folders
- Delete folders with full recursive cascade (projects, tasks, child folders)

**Non-Goals:**
- Moving a folder to a different parent (separate `move-operations` change)
- Changing folder status directly (OmniFocus manages active/dropped based on contents)

## Decisions

### Decision 1: Recursive deletion in the snippet

The snippet for `delete_folder` must implement recursive deletion rather than relying on `deleteObject` to cascade. The pattern is:

```
function deleteFolder(f) {
  f.flattenedProjects.forEach(p => deleteObject(p));
  f.folders.forEach(child => deleteFolder(child));
  deleteObject(f);
}
```

This was validated during bootstrap integration testing (`fixtures.ts` uses this exact pattern).

### Decision 2: `create_folder` placement via optional `parentFolderId`

- `parentFolderId` omitted → top-level folder
- `parentFolderId` provided → nested inside that folder

`new Folder(name)` for top-level; `new Folder(name, parentFolder)` for nested. Snippet resolves the parent by ID.

### Decision 3: No `edit_folder` status field

Folder status (`active` / `dropped`) in OmniFocus reflects whether the folder has active contents — it is not directly user-settable in the same way as project status. `edit_folder` exposes only `name`. If this proves insufficient in practice it can be extended.

### Decision 4: `delete_folder` tool description is the strongest warning in the server

This is the most destructive single operation: one call can delete an entire project hierarchy. The tool description must explicitly state that all child folders, projects, and tasks are permanently deleted, and that the AI must confirm with the user before calling it.

## Risks / Trade-offs

- **`deleteObject` on folder leaves shell** — confirmed behavior; recursive snippet pattern mitigates this fully.
- **Deleting a folder containing hundreds of projects** — could be slow inside `evaluateJavascript`; the 30s timeout applies. Not worth special-casing in v1.
- **Race between read and delete** — if the user reads a folder ID then calls delete, OmniFocus has no transaction isolation. Acceptable for a single-user desktop app.
