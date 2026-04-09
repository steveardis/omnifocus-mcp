/**
 * list_projects.js — List all projects in OmniFocus
 *
 * PASTE-TO-CONSOLE:
 *   Replace ARGS_PLACEHOLDER with: {} and run in OmniFocus Automation Console.
 *   Example: const args = {};
 */
(() => {
  const args = __ARGS__;
  void args; // no args needed for listing

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

  const projects = flattenedProjects.map(function(p) {
    return {
      id: p.id.primaryKey,
      name: p.name,
      folderPath: folderPath(p),
      status: projectStatus(p),
      type: projectType(p),
    };
  });

  return JSON.stringify({ ok: true, data: projects });
})();
