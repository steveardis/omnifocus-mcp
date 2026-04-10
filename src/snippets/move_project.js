/**
 * move_project.js — Move a project to a different folder or to the top level
 *
 * PASTE-TO-CONSOLE:
 *   Replace ARGS_PLACEHOLDER with one of:
 *     { id: "project-id", folderId: "folder-id" }
 *     { id: "project-id", folderId: null }
 *   Example: const args = { id: "jMBMptE7rJ1", folderId: null };
 */
(() => {
  const args = __ARGS__;

  function NotFoundError(msg) { var e = new Error(msg); e.name = "NotFoundError"; return e; }

  function projectStatusString(project) {
    var s = project.status;
    if (s === Project.Status.Active) return "active";
    if (s === Project.Status.OnHold) return "onHold";
    if (s === Project.Status.Done) return "done";
    if (s === Project.Status.Dropped) return "dropped";
    return "active";
  }

  function projectType(project) {
    if (project.containsSingletonActions) return "singleActions";
    if (project.sequential) return "sequential";
    return "parallel";
  }

  function folderPath(project) {
    var parts = [];
    var container = project.parentFolder;
    while (container) {
      parts.unshift(container.name);
      container = container.parent;
    }
    return parts.join(" \u25b8 ");
  }

  // ── Resolve project ────────────────────────────────────────────────────────

  var project = flattenedProjects.find(function(p) {
    return p.id.primaryKey === args.id;
  });
  if (!project) throw new NotFoundError("Project not found: " + args.id);

  // ── Move ───────────────────────────────────────────────────────────────────

  if (args.folderId !== null && args.folderId !== undefined) {
    var folder = flattenedFolders.find(function(f) {
      return f.id.primaryKey === args.folderId;
    });
    if (!folder) throw new NotFoundError("Folder not found: " + args.folderId);
    moveSections([project], folder);
  } else {
    // moveSections requires a non-null position. To reach the root level, anchor
    // to the first root-level folder's .before location (a root-level insertion point).
    var rootFolder = flattenedFolders.find(function(f) { return !f.parent; });
    if (!rootFolder) {
      throw new Error("Cannot move project to top level: no root-level folders found to anchor position");
    }
    moveSections([project], rootFolder.before);
  }

  // ── Return updated summary ─────────────────────────────────────────────────

  return JSON.stringify({
    ok: true,
    data: {
      id: project.id.primaryKey,
      name: project.name,
      folderPath: folderPath(project),
      folderId: project.parentFolder ? project.parentFolder.id.primaryKey : null,
      status: projectStatusString(project),
      type: projectType(project),
      flagged: project.flagged || false,
    },
  });
})();
