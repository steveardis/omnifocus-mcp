/**
 * delete_task.js — Permanently delete a task and all its subtasks by ID
 *
 * PASTE-TO-CONSOLE:
 *   Replace ARGS_PLACEHOLDER with: { id: "your-task-id" }
 *   Example: const args = { id: "jMBMptE7rJ1" };
 */
(() => {
  const args = __ARGS__;

  function NotFoundError(msg) { var e = new Error(msg); e.name = "NotFoundError"; return e; }

  var task = flattenedTasks.find(function(t) { return t.id.primaryKey === args.id; });
  if (!task) throw new NotFoundError("Task not found: " + args.id);

  var id = task.id.primaryKey;
  deleteObject(task);

  return JSON.stringify({ ok: true, data: { id: id } });
})();
