/**
 * get_tag.js — Get full tag detail by ID
 *
 * PASTE-TO-CONSOLE:
 *   Replace ARGS_PLACEHOLDER with: { id: "your-tag-id" }
 *   Example: const args = { id: "jMBMptE7rJ1" };
 */
(() => {
  const args = __ARGS__;

  function NotFoundError(msg) { var e = new Error(msg); e.name = "NotFoundError"; return e; }

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

  const tag = flattenedTags.find(function(t) {
    return t.id.primaryKey === args.id;
  });

  if (!tag) {
    throw new NotFoundError("Tag not found: " + args.id);
  }

  const detail = {
    id: tag.id.primaryKey,
    name: tag.name,
    path: buildPath(tag),
    parentId: tag.parent ? tag.parent.id.primaryKey : null,
    status: tagStatus(tag),
    childTagIds: (tag.children || []).map(function(c) { return c.id.primaryKey; }),
  };

  return JSON.stringify({ ok: true, data: detail });
})();
