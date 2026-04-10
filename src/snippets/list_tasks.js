/**
 * list_tasks.js — List tasks within a specified scope with optional filtering
 *
 * PASTE-TO-CONSOLE:
 *   Replace ARGS_PLACEHOLDER with one of:
 *     { scope: { projectId: "your-project-id" } }
 *     { scope: { folderId: "your-folder-id" } }
 *     { scope: { inbox: true } }
 *     { scope: { all: true } }
 *     { scope: { all: true }, filter: { flagged: true } }
 *     { scope: { all: true }, filter: { status: ["overdue", "dueSoon"] } }
 *     { scope: { all: true }, filter: { dueBeforeDate: "2026-04-09T23:59:59Z" } }
 *   Example: const args = { scope: { inbox: true } };
 */
(() => {
  const args = __ARGS__;

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
    if (!task.assignedContainer) return { containerId: null, containerType: null };
    var c = task.assignedContainer;
    if (c instanceof Project) {
      return { containerId: c.id.primaryKey, containerType: "project" };
    }
    return { containerId: c.id.primaryKey, containerType: "task" };
  }

  function mapTask(task, overrideContainerType) {
    var ci = containerInfo(task);
    return {
      id: task.id.primaryKey,
      name: task.name,
      status: taskStatusString(task),
      flagged: task.flagged || false,
      containerId: ci.containerId,
      containerType: overrideContainerType || ci.containerType,
      dueDate: task.dueDate ? task.dueDate.toISOString() : null,
      tagIds: (task.tags || []).map(function(t) { return t.id.primaryKey; }),
    };
  }

  // ── Scope resolution ────────────────────────────────────────────────────────

  var scope = args.scope;
  var tasks = [];

  if (scope.projectId) {
    var project = flattenedProjects.find(function(p) {
      return p.id.primaryKey === scope.projectId;
    });
    if (!project) {
      return JSON.stringify({ ok: false, error: { name: "NotFoundError", message: "Project not found: " + scope.projectId } });
    }
    tasks = project.flattenedTasks.map(function(t) { return mapTask(t, "project"); });
  } else if (scope.folderId) {
    var folder = flattenedFolders.find(function(f) {
      return f.id.primaryKey === scope.folderId;
    });
    if (!folder) {
      return JSON.stringify({ ok: false, error: { name: "NotFoundError", message: "Folder not found: " + scope.folderId } });
    }
    folder.flattenedProjects.forEach(function(p) {
      p.flattenedTasks.forEach(function(t) { tasks.push(mapTask(t, "project")); });
    });
  } else if (scope.inbox) {
    tasks = flattenedTasks
      .filter(function(t) { return !t.containingProject && !t.parentTask; })
      .map(function(t) { return mapTask(t, "inbox"); });
  } else if (scope.all) {
    tasks = flattenedTasks.map(function(t) { return mapTask(t, null); });
  }

  // ── Filtering ───────────────────────────────────────────────────────────────

  var filter = args.filter || {};
  var hasStatusFilter = Array.isArray(filter.status) && filter.status.length > 0;

  // Default: exclude complete and dropped when no explicit status filter
  if (!hasStatusFilter) {
    tasks = tasks.filter(function(t) {
      return t.status !== "complete" && t.status !== "dropped";
    });
  } else {
    tasks = tasks.filter(function(t) {
      return filter.status.indexOf(t.status) !== -1;
    });
  }

  if (filter.flagged === true) {
    tasks = tasks.filter(function(t) { return t.flagged === true; });
  }

  if (filter.tagId) {
    tasks = tasks.filter(function(t) {
      return t.tagIds.indexOf(filter.tagId) !== -1;
    });
  }

  if (filter.dueBeforeDate) {
    var cutoff = new Date(filter.dueBeforeDate);
    tasks = tasks.filter(function(t) {
      return t.dueDate !== null && new Date(t.dueDate) <= cutoff;
    });
  }

  // ── Limit ───────────────────────────────────────────────────────────────────

  var limit = (args.limit !== undefined && args.limit !== null) ? args.limit : 200;
  if (tasks.length > limit) {
    tasks = tasks.slice(0, limit);
  }

  return JSON.stringify({ ok: true, data: tasks });
})();
