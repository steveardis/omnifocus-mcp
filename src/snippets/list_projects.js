/**
 * list_projects.js — List projects in OmniFocus with optional filtering
 *
 * PASTE-TO-CONSOLE:
 *   Replace ARGS_PLACEHOLDER with one of:
 *     {}
 *     { filter: { status: ["active"] } }
 *     { filter: { folderId: "abc123" } }
 *     { filter: { flagged: true } }
 *     { limit: 50 }
 *   Example: const args = {};
 */
(() => {
  const args = __ARGS__;

  function NotFoundError(msg) { var e = new Error(msg); e.name = "NotFoundError"; return e; }

  function folderPath(project) {
    var parts = [];
    var container = project.parentFolder;
    while (container) {
      parts.unshift(container.name);
      container = container.parent;
    }
    return parts.join(" \u25b8 ");
  }

  function projectType(project) {
    if (project.containsSingletonActions) return "singleActions";
    if (project.sequential) return "sequential";
    return "parallel";
  }

  function projectStatusString(project) {
    var s = project.status;
    if (s === Project.Status.Active) return "active";
    if (s === Project.Status.OnHold) return "onHold";
    if (s === Project.Status.Done) return "done";
    if (s === Project.Status.Dropped) return "dropped";
    return "active";
  }

  function mapProject(p) {
    return {
      id: p.id.primaryKey,
      name: p.name,
      folderPath: folderPath(p),
      folderId: p.parentFolder ? p.parentFolder.id.primaryKey : null,
      status: projectStatusString(p),
      type: projectType(p),
      flagged: p.flagged || false,
    };
  }

  // ── Scope: start from folder subtree or all projects ───────────────────────

  var filter = args.filter || {};
  var projects;

  if (filter.folderId) {
    var folder = flattenedFolders.find(function(f) {
      return f.id.primaryKey === filter.folderId;
    });
    if (!folder) throw new NotFoundError("Folder not found: " + filter.folderId);
    projects = folder.flattenedProjects.map(mapProject);
  } else {
    projects = flattenedProjects.map(mapProject);
  }

  // ── Status filter ───────────────────────────────────────────────────────────

  var hasStatusFilter = Array.isArray(filter.status) && filter.status.length > 0;

  if (!hasStatusFilter) {
    projects = projects.filter(function(p) {
      return p.status !== "done" && p.status !== "dropped";
    });
  } else {
    projects = projects.filter(function(p) {
      return filter.status.indexOf(p.status) !== -1;
    });
  }

  // ── Flagged filter ──────────────────────────────────────────────────────────

  if (filter.flagged === true) {
    projects = projects.filter(function(p) { return p.flagged === true; });
  }

  // ── Limit ───────────────────────────────────────────────────────────────────

  var limit = (args.limit !== undefined && args.limit !== null) ? args.limit : 100;
  if (projects.length > limit) {
    projects = projects.slice(0, limit);
  }

  return JSON.stringify({ ok: true, data: projects });
})();
