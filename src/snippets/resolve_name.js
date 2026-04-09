/**
 * resolve_name.js — Resolve entity name to ID candidates
 *
 * PASTE-TO-CONSOLE:
 *   Replace ARGS_PLACEHOLDER with: { type: "project", query: "My Project", scope: null }
 *   Example: const args = { type: "folder", query: "Work", scope: null };
 *
 * Returns ALL matches (never silently picks one).
 * Returns empty array on no match (does not throw).
 */
(() => {
  const args = __ARGS__;

  function buildPath(entity) {
    const parts = [];
    let current = entity;
    while (current) {
      parts.unshift(current.name);
      current = current.parent;
    }
    return parts.join(" \u25b8 ");
  }

  // Projects use parentFolder (not .parent, which is the Task parent)
  function buildProjectPath(project) {
    const parts = [project.name];
    let folder = project.parentFolder;
    while (folder) {
      parts.unshift(folder.name);
      folder = folder.parent;
    }
    return parts.join(" \u25b8 ");
  }

  function inScope(path, scope) {
    if (!scope) return true;
    return path.startsWith(scope + " \u25b8 ") || path === scope;
  }

  function matchName(entity, query) {
    return entity.name === query;
  }

  const type = args.type;
  const query = args.query;
  const scope = args.scope || null;

  var candidates = [];

  if (type === "project") {
    flattenedProjects.forEach(function(p) {
      if (!matchName(p, query)) return;
      const path = buildProjectPath(p);
      if (!inScope(path, scope)) return;
      candidates.push({ id: p.id.primaryKey, name: p.name, path: path, type: "project" });
    });
  } else if (type === "folder") {
    flattenedFolders.forEach(function(f) {
      if (!matchName(f, query)) return;
      const path = buildPath(f);
      if (!inScope(path, scope)) return;
      candidates.push({ id: f.id.primaryKey, name: f.name, path: path, type: "folder" });
    });
  } else if (type === "task") {
    flattenedTasks.forEach(function(t) {
      if (!matchName(t, query)) return;
      // Build path as "Project ▸ Task" for disambiguation; fall back to task name for inbox tasks
      var taskPath = t.containingProject
        ? t.containingProject.name + " \u25b8 " + t.name
        : t.name;
      candidates.push({ id: t.id.primaryKey, name: t.name, path: taskPath, type: "task" });
    });
  } else if (type === "tag") {
    flattenedTags.forEach(function(t) {
      if (!matchName(t, query)) return;
      const path = buildPath(t);
      if (!inScope(path, scope)) return;
      candidates.push({ id: t.id.primaryKey, name: t.name, path: path, type: "tag" });
    });
  }

  return JSON.stringify({ ok: true, data: candidates });
})();
