/**
 * get_project.js — Get full project detail by ID
 *
 * PASTE-TO-CONSOLE:
 *   Replace ARGS_PLACEHOLDER with: { id: "your-project-id" }
 *   Example: const args = { id: "jMBMptE7rJ1" };
 */
(() => {
  const args = __ARGS__;

  function NotFoundError(msg) { var e = new Error(msg); e.name = "NotFoundError"; return e; }

  function folderPath(project) {
    const parts = [];
    let container = project.parentFolder;
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
    const s = project.status;
    if (s === Project.Status.Active) return "active";
    if (s === Project.Status.OnHold) return "onHold";
    if (s === Project.Status.Done) return "done";
    if (s === Project.Status.Dropped) return "dropped";
    return "active";
  }

  function isoOrNull(d) {
    return d ? d.toISOString() : null;
  }

  function reviewIntervalString(p) {
    try {
      const ri = p.reviewInterval;
      if (!ri) return null;
      // ReviewInterval has .steps (number) and .unit (enum: days/weeks/months/years)
      return ri.steps + ' ' + ri.unit;
    } catch(_) { return null; }
  }

  const project = flattenedProjects.find(function(p) {
    return p.id.primaryKey === args.id;
  });

  if (!project) {
    throw new NotFoundError("Project not found: " + args.id);
  }

  const detail = {
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

  return JSON.stringify({ ok: true, data: detail });
})();
