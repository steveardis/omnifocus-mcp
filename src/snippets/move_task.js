/**
 * move_task.js — Move a task to a different project or make it a subtask
 *
 * PASTE-TO-CONSOLE:
 *   Replace ARGS_PLACEHOLDER with one of:
 *     { id: "task-id", projectId: "project-id" }
 *     { id: "task-id", parentTaskId: "parent-task-id" }
 *   Example: const args = { id: "jMBMptE7rJ1", projectId: "kABCdef123" };
 */
(() => {
  const args = __ARGS__;

  function NotFoundError(msg) { var e = new Error(msg); e.name = "NotFoundError"; return e; }
  function ValidationError(msg) { var e = new Error(msg); e.name = "ValidationError"; return e; }

  function taskStatusString(task) {
    try {
      var s = task.taskStatus;
      if (s === Task.Status.Available) return "available";
      if (s === Task.Status.Blocked) return "blocked";
      if (s === Task.Status.Completed) return "complete";
      if (s === Task.Status.Dropped) return "dropped";
      if (s === Task.Status.DueSoon) return "dueSoon";
      if (s === Task.Status.Next) return "next";
      if (s === Task.Status.Overdue) return "overdue";
      return "incomplete";
    } catch(_) { return "incomplete"; }
  }

  function containerInfo(task) {
    // Use parentTask and containingProject rather than assignedContainer —
    // assignedContainer reflects original placement and doesn't update after moveTasks.
    if (task.parentTask) {
      return { containerId: task.parentTask.id.primaryKey, containerType: "task" };
    }
    var proj = task.containingProject;
    if (proj) {
      return { containerId: proj.id.primaryKey, containerType: "project" };
    }
    return { containerId: null, containerType: "inbox" };
  }

  // ── Validate: exactly one destination ──────────────────────────────────────

  var hasProject = args.projectId !== undefined && args.projectId !== null;
  var hasParent = args.parentTaskId !== undefined && args.parentTaskId !== null;

  if (hasProject && hasParent) {
    throw new ValidationError("Exactly one of projectId or parentTaskId must be provided, not both");
  }
  if (!hasProject && !hasParent) {
    throw new ValidationError("Exactly one of projectId or parentTaskId must be provided");
  }

  // ── Resolve task ───────────────────────────────────────────────────────────

  var task = flattenedTasks.find(function(t) {
    return t.id.primaryKey === args.id;
  });
  if (!task) throw new NotFoundError("Task not found: " + args.id);

  // ── Move ───────────────────────────────────────────────────────────────────

  if (hasProject) {
    var project = flattenedProjects.find(function(p) {
      return p.id.primaryKey === args.projectId;
    });
    if (!project) throw new NotFoundError("Project not found: " + args.projectId);
    moveTasks([task], project);
  } else {
    var parentTask = flattenedTasks.find(function(t) {
      return t.id.primaryKey === args.parentTaskId;
    });
    if (!parentTask) throw new NotFoundError("Parent task not found: " + args.parentTaskId);
    moveTasks([task], parentTask.ending);
  }

  // ── Return updated summary ─────────────────────────────────────────────────

  // Re-fetch after move.
  var movedTask = flattenedTasks.find(function(t) { return t.id.primaryKey === args.id; }) || task;

  // task.parentTask is unreliable after moveTasks (can return project root task).
  // For the subtask case, verify from the parent side via flattenedTasks.
  var ci;
  if (hasParent) {
    var parentTask2 = flattenedTasks.find(function(t) { return t.id.primaryKey === args.parentTaskId; });
    var isSubtask = parentTask2 && (parentTask2.flattenedTasks || []).some(function(t) {
      return t.id.primaryKey === args.id;
    });
    if (isSubtask) {
      ci = { containerId: parentTask2.id.primaryKey, containerType: "task" };
    } else {
      ci = containerInfo(movedTask);
    }
  } else {
    ci = containerInfo(movedTask);
  }

  return JSON.stringify({
    ok: true,
    data: {
      id: movedTask.id.primaryKey,
      name: movedTask.name,
      status: taskStatusString(movedTask),
      flagged: movedTask.flagged || false,
      containerId: ci.containerId,
      containerType: ci.containerType,
      dueDate: movedTask.dueDate ? movedTask.dueDate.toISOString() : null,
      tagIds: (movedTask.tags || []).map(function(t) { return t.id.primaryKey; }),
    },
  });
})();
