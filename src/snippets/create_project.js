/**
 * create_project.js — Create a new project in OmniFocus
 *
 * PASTE-TO-CONSOLE:
 *   Replace ARGS_PLACEHOLDER with one of:
 *     { name: "My Project" }
 *     { name: "My Project", folderId: "abc123" }
 *     { name: "My Project", type: "sequential", status: "onHold" }
 */
(() => {
  const args = __ARGS__;

  function NotFoundError(msg) { var e = new Error(msg); e.name = "NotFoundError"; return e; }

  function isoOrNull(d) { return d ? d.toISOString() : null; }

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

  function projectStatus(project) {
    var s = project.status;
    if (s === Project.Status.Active) return "active";
    if (s === Project.Status.OnHold) return "onHold";
    if (s === Project.Status.Done) return "done";
    if (s === Project.Status.Dropped) return "dropped";
    return "active";
  }

  function reviewIntervalString(p) {
    try {
      var ri = p.reviewInterval;
      if (!ri) return null;
      return ri.steps + ' ' + ri.unit;
    } catch(_) { return null; }
  }

  function projectDetail(project) {
    return {
      id: project.id.primaryKey,
      name: project.name,
      note: project.note || "",
      folderPath: folderPath(project),
      status: projectStatus(project),
      type: projectType(project),
      flagged: project.flagged || false,
      deferDate: isoOrNull(project.deferDate),
      dueDate: isoOrNull(project.dueDate),
      completionDate: isoOrNull(project.completionDate),
      reviewInterval: reviewIntervalString(project),
      nextReviewDate: isoOrNull(project.nextReviewDate),
      lastReviewDate: isoOrNull(project.lastReviewDate),
      tagIds: (project.tags || []).map(function(t) { return t.id.primaryKey; }),
    };
  }

  var position;
  if (args.folderId) {
    var folder = flattenedFolders.find(function(f) { return f.id.primaryKey === args.folderId; });
    if (!folder) throw new NotFoundError("Folder not found: " + args.folderId);
    position = folder;
  }

  var project = position ? new Project(args.name, position) : new Project(args.name);

  if (args.note !== undefined) project.note = args.note;
  if (args.flagged !== undefined) project.flagged = args.flagged;
  if (args.deferDate !== undefined && args.deferDate !== null) project.deferDate = new Date(args.deferDate);
  if (args.dueDate !== undefined && args.dueDate !== null) project.dueDate = new Date(args.dueDate);

  if (args.type !== undefined) {
    project.sequential = args.type === "sequential";
    project.containsSingletonActions = args.type === "singleActions";
  }

  if (args.status !== undefined) {
    project.status = args.status === "onHold" ? Project.Status.OnHold : Project.Status.Active;
  }

  if (args.reviewInterval !== undefined && args.reviewInterval !== null) {
    // Project.ReviewInterval is not constructible via evaluateJavascript;
    // mutate the existing reviewInterval object in-place instead.
    project.reviewInterval.steps = args.reviewInterval.steps;
  }

  if (args.tagIds && args.tagIds.length > 0) {
    args.tagIds.forEach(function(tagId) {
      var tag = flattenedTags.find(function(t) { return t.id.primaryKey === tagId; });
      if (!tag) throw new NotFoundError("Tag not found: " + tagId);
      project.addTag(tag);
    });
  }

  return JSON.stringify({ ok: true, data: projectDetail(project) });
})();
