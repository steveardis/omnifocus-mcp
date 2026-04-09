/**
 * edit_project.js — Edit an existing project by ID
 *
 * PASTE-TO-CONSOLE:
 *   Replace ARGS_PLACEHOLDER with: { id: "your-project-id", status: "onHold" }
 *   Example: const args = { id: "jMBMptE7rJ1", name: "Updated name", flagged: true };
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

  var project = flattenedProjects.find(function(p) { return p.id.primaryKey === args.id; });
  if (!project) throw new NotFoundError("Project not found: " + args.id);

  if (args.name !== undefined) project.name = args.name;
  if (args.note !== undefined) project.note = args.note;
  if (args.flagged !== undefined) project.flagged = args.flagged;

  if ("deferDate" in args) {
    project.deferDate = args.deferDate ? new Date(args.deferDate) : null;
  }
  if ("dueDate" in args) {
    project.dueDate = args.dueDate ? new Date(args.dueDate) : null;
  }

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

  if (args.tagIds !== undefined) {
    (project.tags || []).slice().forEach(function(t) { project.removeTag(t); });
    args.tagIds.forEach(function(tagId) {
      var tag = flattenedTags.find(function(t) { return t.id.primaryKey === tagId; });
      if (!tag) throw new NotFoundError("Tag not found: " + tagId);
      project.addTag(tag);
    });
  }

  return JSON.stringify({ ok: true, data: projectDetail(project) });
})();
