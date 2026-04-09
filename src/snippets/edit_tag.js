/**
 * edit_tag.js — Edit an existing tag by ID
 *
 * PASTE-TO-CONSOLE:
 *   Replace ARGS_PLACEHOLDER with: { id: "your-tag-id", name: "New Name" }
 *   Or: { id: "your-tag-id", status: "onHold" }
 */
(() => {
  const args = __ARGS__;

  function NotFoundError(msg) { var e = new Error(msg); e.name = "NotFoundError"; return e; }

  function buildPath(tag) {
    var parts = [];
    var current = tag;
    while (current) {
      parts.unshift(current.name);
      current = current.parent;
    }
    return parts.join(" \u25b8 ");
  }

  function tagStatus(tag) {
    try {
      var s = tag.status;
      if (s === Tag.Status.Active) return "active";
      if (s === Tag.Status.OnHold) return "onHold";
      if (s === Tag.Status.Dropped) return "dropped";
      return "active";
    } catch(_) { return "active"; }
  }

  function tagDetail(tag) {
    return {
      id: tag.id.primaryKey,
      name: tag.name,
      path: buildPath(tag),
      parentId: tag.parent ? tag.parent.id.primaryKey : null,
      status: tagStatus(tag),
      childTagIds: (tag.children || []).map(function(c) { return c.id.primaryKey; }),
    };
  }

  var tag = flattenedTags.find(function(t) { return t.id.primaryKey === args.id; });
  if (!tag) throw new NotFoundError("Tag not found: " + args.id);

  if (args.name !== undefined) tag.name = args.name;

  if (args.status !== undefined) {
    if (args.status === "onHold") tag.status = Tag.Status.OnHold;
    else if (args.status === "dropped") tag.status = Tag.Status.Dropped;
    else tag.status = Tag.Status.Active;
  }

  return JSON.stringify({ ok: true, data: tagDetail(tag) });
})();
