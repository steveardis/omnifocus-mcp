/**
 * get_folder.js — Get full folder detail by ID
 *
 * PASTE-TO-CONSOLE:
 *   Replace ARGS_PLACEHOLDER with: { id: "your-folder-id" }
 *   Example: const args = { id: "jMBMptE7rJ1" };
 */
(() => {
  const args = __ARGS__;

  function NotFoundError(msg) { var e = new Error(msg); e.name = "NotFoundError"; return e; }

  function buildPath(folder) {
    const parts = [];
    let current = folder;
    while (current) {
      parts.unshift(current.name);
      current = current.parent;
    }
    return parts.join(" \u25b8 ");
  }

  function folderStatus(folder) {
    try {
      return folder.active === false ? "dropped" : "active";
    } catch(_) { return "active"; }
  }

  const folder = flattenedFolders.find(function(f) {
    return f.id.primaryKey === args.id;
  });

  if (!folder) {
    throw new NotFoundError("Folder not found: " + args.id);
  }

  const detail = {
    id: folder.id.primaryKey,
    name: folder.name,
    path: buildPath(folder),
    parentId: folder.parent ? folder.parent.id.primaryKey : null,
    status: folderStatus(folder),
    childFolderIds: (folder.folders || []).map(function(f) { return f.id.primaryKey; }),
    projectIds: (folder.projects || []).map(function(p) { return p.id.primaryKey; }),
  };

  return JSON.stringify({ ok: true, data: detail });
})();
