/**
 * create_task.js — Create a new task in OmniFocus
 *
 * PASTE-TO-CONSOLE:
 *   Replace ARGS_PLACEHOLDER with one of:
 *     { name: "Buy milk" }
 *     { name: "Write tests", projectId: "abc123" }
 *     { name: "Review PR", parentTaskId: "xyz789" }
 *   Example: const args = { name: "Buy milk" };
 */
(() => {
  const args = __ARGS__;

  function NotFoundError(msg) { var e = new Error(msg); e.name = "NotFoundError"; return e; }
  function ConflictError(msg) { var e = new Error(msg); e.name = "ConflictError"; return e; }

  function isoOrNull(d) { return d ? d.toISOString() : null; }

  function taskStatus(task) {
    try {
      const s = task.taskStatus;
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

  function taskDetail(task) {
    var containerId = null;
    var containerType = null;
    var parentTaskId = null;
    if (task.parentTask) {
      containerId = task.parentTask.id.primaryKey;
      containerType = "task";
      parentTaskId = task.parentTask.id.primaryKey;
    } else if (args.parentTaskId) {
      // task.parentTask may be null immediately after creation; fall back to args
      containerId = args.parentTaskId;
      containerType = "task";
      parentTaskId = args.parentTaskId;
    } else if (task.containingProject) {
      containerId = task.containingProject.id.primaryKey;
      containerType = "project";
    } else if (!args.projectId && !args.parentTaskId) {
      containerType = "inbox";
    }
    return {
      id: task.id.primaryKey,
      name: task.name,
      note: task.note || "",
      status: taskStatus(task),
      flagged: task.flagged || false,
      deferDate: isoOrNull(task.deferDate),
      dueDate: isoOrNull(task.dueDate),
      completionDate: isoOrNull(task.completionDate),
      estimatedMinutes: task.estimatedMinutes || null,
      containerId: containerId,
      containerType: containerType,
      tagIds: (task.tags || []).map(function(t) { return t.id.primaryKey; }),
      parentTaskId: parentTaskId,
    };
  }

  if (args.projectId && args.parentTaskId) {
    throw new ConflictError("Provide projectId or parentTaskId, not both");
  }

  var position;
  if (args.projectId) {
    var project = flattenedProjects.find(function(p) { return p.id.primaryKey === args.projectId; });
    if (!project) throw new NotFoundError("Project not found: " + args.projectId);
    position = project;
  } else if (args.parentTaskId) {
    var parentTask = flattenedTasks.find(function(t) { return t.id.primaryKey === args.parentTaskId; });
    if (!parentTask) throw new NotFoundError("Parent task not found: " + args.parentTaskId);
    position = parentTask;
  } else {
    position = inbox.beginning;
  }

  var task = new Task(args.name, position);

  if (args.note !== undefined) task.note = args.note;
  if (args.flagged !== undefined) task.flagged = args.flagged;
  if (args.deferDate !== undefined && args.deferDate !== null) task.deferDate = new Date(args.deferDate);
  if (args.dueDate !== undefined && args.dueDate !== null) task.dueDate = new Date(args.dueDate);
  if (args.estimatedMinutes !== undefined && args.estimatedMinutes !== null) task.estimatedMinutes = args.estimatedMinutes;

  if (args.tagIds && args.tagIds.length > 0) {
    args.tagIds.forEach(function(tagId) {
      var tag = flattenedTags.find(function(t) { return t.id.primaryKey === tagId; });
      if (!tag) throw new NotFoundError("Tag not found: " + tagId);
      task.addTag(tag);
    });
  }

  return JSON.stringify({ ok: true, data: taskDetail(task) });
})();
