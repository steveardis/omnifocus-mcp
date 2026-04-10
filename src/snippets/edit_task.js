/**
 * edit_task.js — Edit an existing task by ID
 *
 * PASTE-TO-CONSOLE:
 *   Replace ARGS_PLACEHOLDER with: { id: "your-task-id", flagged: true }
 *   Example: const args = { id: "jMBMptE7rJ1", name: "Updated name", flagged: true };
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

  var DAY_ABBR = {
    sunday: "SU", monday: "MO", tuesday: "TU", wednesday: "WE",
    thursday: "TH", friday: "FR", saturday: "SA"
  };

  var FREQ_MAP = { daily: "DAILY", weekly: "WEEKLY", monthly: "MONTHLY", yearly: "YEARLY" };

  function buildRrule(rule) {
    var rrule = "FREQ=" + FREQ_MAP[rule.frequency] + ";INTERVAL=" + (rule.interval || 1);
    if (rule.daysOfWeek && rule.daysOfWeek.length > 0) {
      rrule += ";BYDAY=" + rule.daysOfWeek.map(function(d) { return DAY_ABBR[d]; }).join(",");
    }
    return rrule;
  }

  function buildMethod(methodStr) {
    var m = Task.RepetitionMethod;
    if (methodStr === "dueDate") return m.DueDate;
    if (methodStr === "start") return m.DeferUntilDate;
    return m.Fixed;
  }

  function parseMethod(method) {
    var s = String(method);
    if (s.indexOf("DueDate") >= 0) return "dueDate";
    if (s.indexOf("DeferUntilDate") >= 0) return "start";
    return "fixed";
  }

  function parseRepetitionRule(rule) {
    if (!rule) return null;
    try {
      var ruleStr = rule.ruleString || "";
      var parts = {};
      ruleStr.split(";").forEach(function(part) {
        var kv = part.split("=");
        if (kv.length === 2) parts[kv[0]] = kv[1];
      });
      var freqMap = { DAILY: "daily", WEEKLY: "weekly", MONTHLY: "monthly", YEARLY: "yearly" };
      var frequency = freqMap[parts["FREQ"]] || "daily";
      var interval = parts["INTERVAL"] ? parseInt(parts["INTERVAL"], 10) : 1;
      var ABBR_DAY = { SU: "sunday", MO: "monday", TU: "tuesday", WE: "wednesday", TH: "thursday", FR: "friday", SA: "saturday" };
      var daysOfWeek = parts["BYDAY"] ? parts["BYDAY"].split(",").map(function(a) { return ABBR_DAY[a]; }).filter(Boolean) : undefined;
      var result = { frequency: frequency, interval: interval, method: parseMethod(rule.method) };
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

  if (args.name !== undefined) task.name = args.name;
  if (args.note !== undefined) task.note = args.note;
  if (args.flagged !== undefined) task.flagged = args.flagged;

  if ("deferDate" in args) {
    task.deferDate = args.deferDate ? new Date(args.deferDate) : null;
  }
  if ("dueDate" in args) {
    task.dueDate = args.dueDate ? new Date(args.dueDate) : null;
  }
  if ("estimatedMinutes" in args) {
    task.estimatedMinutes = args.estimatedMinutes;
  }

  if (args.tagIds !== undefined) {
    // Replace full tag set: remove all existing, add new ones
    (task.tags || []).slice().forEach(function(t) { task.removeTag(t); });
    args.tagIds.forEach(function(tagId) {
      var tag = flattenedTags.find(function(t) { return t.id.primaryKey === tagId; });
      if (!tag) throw new NotFoundError("Tag not found: " + tagId);
      task.addTag(tag);
    });
  }

  if ("repetitionRule" in args) {
    if (args.repetitionRule === null) {
      task.repetitionRule = null;
    } else if (args.repetitionRule) {
      task.repetitionRule = new Task.RepetitionRule(buildRrule(args.repetitionRule), buildMethod(args.repetitionRule.method));
    }
  }

  return JSON.stringify({ ok: true, data: taskDetail(task) });
})();
