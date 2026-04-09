/**
 * delete_folder.js — Recursively delete a folder and all its contents by ID
 *
 * PASTE-TO-CONSOLE:
 *   Replace ARGS_PLACEHOLDER with: { id: "your-folder-id" }
 *   WARNING: Permanently deletes all child folders, projects, and tasks.
 */
(() => {
  const args = __ARGS__;

  function NotFoundError(msg) { var e = new Error(msg); e.name = "NotFoundError"; return e; }

  function deleteFolder(f) {
    f.flattenedProjects.forEach(function(p) { deleteObject(p); });
    f.folders.forEach(function(child) { deleteFolder(child); });
    deleteObject(f);
  }

  var folder = flattenedFolders.find(function(f) { return f.id.primaryKey === args.id; });
  if (!folder) throw new NotFoundError("Folder not found: " + args.id);

  var id = folder.id.primaryKey;
  deleteFolder(folder);

  return JSON.stringify({ ok: true, data: { id: id } });
})();
