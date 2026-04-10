/**
 * complete_task.js — Mark a task complete by ID
 *
 * PASTE-TO-CONSOLE:
 *   Replace ARGS_PLACEHOLDER with: { id: "your-task-id" }
 *   Example: const args = { id: "jMBMptE7rJ1" };
 */
(() => {
  const args = __ARGS__;

  function NotFoundError(msg) { var e = new Error(msg); e.name = "NotFoundError"; return e; }

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

  function parseRepetitionRule(rule) {
    if (!rule) return null;
    try {
      var parts = {};
      (rule.ruleString || "").split(";").forEach(function(part) {
        var kv = part.split("=");
        if (kv.length === 2) parts[kv[0]] = kv[1];
      });
      var freqMap = { DAILY: "daily", WEEKLY: "weekly", MONTHLY: "monthly", YEARLY: "yearly" };
      var frequency = freqMap[parts["FREQ"]] || "daily";
      var interval = parts["INTERVAL"] ? parseInt(parts["INTERVAL"], 10) : 1;
      var ABBR_DAY = { SU: "sunday", MO: "monday", TU: "tuesday", WE: "wednesday", TH: "thursday", FR: "friday", SA: "saturday" };
      var daysOfWeek = parts["BYDAY"] ? parts["BYDAY"].split(",").map(function(a) { return ABBR_DAY[a]; }).filter(Boolean) : undefined;
      var ms = String(rule.method);
      var method = ms.indexOf("DueDate") >= 0 ? "dueDate" : ms.indexOf("DeferUntilDate") >= 0 ? "start" : "fixed";
      var result = { frequency: frequency, interval: interval, method: method };
      if (daysOfWeek && daysOfWeek.length > 0) result.daysOfWeek = daysOfWeek;
      return result;
    } catch(_) { return null; }
  }

  function taskDetail(task) {
    var containerId = null;
    var containerType = null;
    if (task.parentTask) {
      containerId = task.parentTask.id.primaryKey;
      containerType = "task";
    } else if (task.containingProject) {
      containerId = task.containingProject.id.primaryKey;
      containerType = "project";
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
      parentTaskId: task.parentTask ? task.parentTask.id.primaryKey : null,
      repetitionRule: parseRepetitionRule(task.repetitionRule),
    };
  }

  var task = flattenedTasks.find(function(t) { return t.id.primaryKey === args.id; });
  if (!task) throw new NotFoundError("Task not found: " + args.id);

  task.markComplete();

  return JSON.stringify({ ok: true, data: taskDetail(task) });
})();
