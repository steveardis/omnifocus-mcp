/**
 * create_task.js — Create a new task in OmniFocus
 *
 * PASTE-TO-CONSOLE:
 *   Replace ARGS_PLACEHOLDER with one of:
 *     { name: "Buy milk" }
 *     { name: "Write tests", projectId: "abc123" }
 *     { name: "Stand-up", repetitionRule: { frequency: "daily", interval: 1, method: "fixed" } }
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
      repetitionRule: parseRepetitionRule(task.repetitionRule),
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

  if (args.repetitionRule) {
    task.repetitionRule = new Task.RepetitionRule(buildRrule(args.repetitionRule), buildMethod(args.repetitionRule.method));
  }

  return JSON.stringify({ ok: true, data: taskDetail(task) });
})();
