/**
 * list_tags.js — List all tags in OmniFocus with optional filtering
 *
 * PASTE-TO-CONSOLE:
 *   Replace ARGS_PLACEHOLDER with one of:
 *     {}
 *     { filter: { status: "active" } }
 *     { limit: 50 }
 *   Example: const args = { filter: { status: "active" }, limit: 100 };
 */
(() => {
  const args = __ARGS__;

  function buildPath(tag) {
    const parts = [];
    let current = tag;
    while (current) {
      parts.unshift(current.name);
      current = current.parent;
    }
    return parts.join(" \u25b8 ");
  }

  function tagStatus(tag) {
    try {
      const s = tag.status;
      if (s === Tag.Status.Active) return "active";
      if (s === Tag.Status.OnHold) return "onHold";
      if (s === Tag.Status.Dropped) return "dropped";
      return "active";
    } catch(_) { return "active"; }
  }

  const limit = (args.limit !== undefined && args.limit !== null) ? args.limit : 200;
  const statusFilter = args.filter && args.filter.status ? args.filter.status : null;

  var tags = [];
  var all = flattenedTags;
  for (var i = 0; i < all.length; i++) {
    var t = all[i];
    var status = tagStatus(t);
    if (statusFilter && status !== statusFilter) continue;
    tags.push({
      id: t.id.primaryKey,
      name: t.name,
      path: buildPath(t),
      parentId: t.parent ? t.parent.id.primaryKey : null,
      status: status,
    });
    if (tags.length >= limit) break;
  }

  return JSON.stringify({ ok: true, data: tags });
})();
