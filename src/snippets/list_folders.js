/**
 * list_folders.js — List all folders in OmniFocus
 *
 * PASTE-TO-CONSOLE:
 *   Replace ARGS_PLACEHOLDER with: {} and run in OmniFocus Automation Console.
 *   Example: const args = {};
 */
(() => {
  const args = __ARGS__;
  void args; // no args needed for listing

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

  const folders = flattenedFolders.map(function(f) {
    return {
      id: f.id.primaryKey,
      name: f.name,
      path: buildPath(f),
      parentId: f.parent ? f.parent.id.primaryKey : null,
      status: folderStatus(f),
    };
  });

  return JSON.stringify({ ok: true, data: folders });
})();
