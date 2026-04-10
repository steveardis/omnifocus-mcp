/**
 * list_folders.js — List all folders in OmniFocus with optional filtering
 *
 * PASTE-TO-CONSOLE:
 *   Replace ARGS_PLACEHOLDER with one of:
 *     {}
 *     { filter: { status: "active" } }
 *     { limit: 50 }
 *   Example: const args = { filter: { status: "active" }, limit: 100 };
 */
(() => {
  const args = __ARGS__;

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

  const limit = (args.limit !== undefined && args.limit !== null) ? args.limit : 200;
  const statusFilter = args.filter && args.filter.status ? args.filter.status : null;

  var folders = [];
  var all = flattenedFolders;
  for (var i = 0; i < all.length; i++) {
    var f = all[i];
    var status = folderStatus(f);
    if (statusFilter && status !== statusFilter) continue;
    folders.push({
      id: f.id.primaryKey,
      name: f.name,
      path: buildPath(f),
      parentId: f.parent ? f.parent.id.primaryKey : null,
      status: status,
    });
    if (folders.length >= limit) break;
  }

  return JSON.stringify({ ok: true, data: folders });
})();
