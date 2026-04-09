/**
 * delete_project.js — Permanently delete a project and all its tasks by ID
 *
 * PASTE-TO-CONSOLE:
 *   Replace ARGS_PLACEHOLDER with: { id: "your-project-id" }
 *   Example: const args = { id: "jMBMptE7rJ1" };
 */
(() => {
  const args = __ARGS__;

  function NotFoundError(msg) { var e = new Error(msg); e.name = "NotFoundError"; return e; }

  var project = flattenedProjects.find(function(p) { return p.id.primaryKey === args.id; });
  if (!project) throw new NotFoundError("Project not found: " + args.id);

  var id = project.id.primaryKey;
  deleteObject(project);

  return JSON.stringify({ ok: true, data: { id: id } });
})();
