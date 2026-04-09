/**
 * list_tasks.js — List tasks within a specified scope
 *
 * PASTE-TO-CONSOLE:
 *   Replace ARGS_PLACEHOLDER with one of:
 *     { scope: { projectId: "your-project-id" } }
 *     { scope: { folderId: "your-folder-id" } }
 *     { scope: { inbox: true } }
 *     { scope: { all: true } }
 *   Example: const args = { scope: { inbox: true } };
 */
(() => {
  const args = __ARGS__;

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

  function containerInfo(task) {
    if (!task.assignedContainer) return { containerId: null, containerType: null };
    const c = task.assignedContainer;
    if (c instanceof Project) {
      return { containerId: c.id.primaryKey, containerType: "project" };
    }
    return { containerId: c.id.primaryKey, containerType: "task" };
  }

  function mapTask(task, containerType) {
    const ci = containerInfo(task);
    return {
      id: task.id.primaryKey,
      name: task.name,
      status: taskStatus(task),
      flagged: task.flagged || false,
      containerId: ci.containerId,
      containerType: containerType || ci.containerType,
    };
  }

  const scope = args.scope;
  let tasks = [];

  if (scope.projectId) {
    const project = flattenedProjects.find(function(p) {
      return p.id.primaryKey === scope.projectId;
    });
    if (!project) {
      return JSON.stringify({ ok: false, error: { name: "NotFoundError", message: "Project not found: " + scope.projectId } });
    }
    tasks = project.flattenedTasks.map(function(t) { return mapTask(t, "project"); });
  } else if (scope.folderId) {
    const folder = flattenedFolders.find(function(f) {
      return f.id.primaryKey === scope.folderId;
    });
    if (!folder) {
      return JSON.stringify({ ok: false, error: { name: "NotFoundError", message: "Folder not found: " + scope.folderId } });
    }
    folder.flattenedProjects.forEach(function(p) {
      p.flattenedTasks.forEach(function(t) { tasks.push(mapTask(t, "project")); });
    });
  } else if (scope.inbox) {
    // Inbox tasks have no containing project. Use the flattenedTasks global
    // (not document.flattenedTasks — document is not the DB in this context).
    // True inbox tasks: no containing project AND no parent task (excludes subtasks of inbox items)
    tasks = flattenedTasks.filter(function(t) { return !t.containingProject && !t.parentTask; }).map(function(t) { return mapTask(t, "inbox"); });
  } else if (scope.all) {
    tasks = flattenedTasks.map(function(t) { return mapTask(t, null); });
  }

  return JSON.stringify({ ok: true, data: tasks });
})();
