/**
 * create_folder.js — Create a new folder in OmniFocus
 *
 * PASTE-TO-CONSOLE:
 *   Replace ARGS_PLACEHOLDER with one of:
 *     { name: "My Folder" }
 *     { name: "Nested Folder", parentFolderId: "abc123" }
 */
(() => {
  const args = __ARGS__;

  function NotFoundError(msg) { var e = new Error(msg); e.name = "NotFoundError"; return e; }

  function buildPath(folder) {
    var parts = [];
    var current = folder;
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

  function folderDetail(folder) {
    return {
      id: folder.id.primaryKey,
      name: folder.name,
      path: buildPath(folder),
      parentId: folder.parent ? folder.parent.id.primaryKey : null,
      status: folderStatus(folder),
      childFolderIds: (folder.folders || []).map(function(f) { return f.id.primaryKey; }),
      projectIds: (folder.projects || []).map(function(p) { return p.id.primaryKey; }),
    };
  }

  var folder;
  if (args.parentFolderId) {
    var parent = flattenedFolders.find(function(f) { return f.id.primaryKey === args.parentFolderId; });
    if (!parent) throw new NotFoundError("Folder not found: " + args.parentFolderId);
    folder = new Folder(args.name, parent);
  } else {
    folder = new Folder(args.name);
  }

  return JSON.stringify({ ok: true, data: folderDetail(folder) });
})();
