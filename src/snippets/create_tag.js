/**
 * create_tag.js — Create a new tag in OmniFocus
 *
 * PASTE-TO-CONSOLE:
 *   Replace ARGS_PLACEHOLDER with one of:
 *     { name: "Waiting" }
 *     { name: "Email", parentTagId: "abc123" }
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

  var tag;
  if (args.parentTagId) {
    var parent = flattenedTags.find(function(t) { return t.id.primaryKey === args.parentTagId; });
    if (!parent) throw new NotFoundError("Tag not found: " + args.parentTagId);
    tag = new Tag(args.name, parent);
  } else {
    tag = new Tag(args.name);
  }

  return JSON.stringify({ ok: true, data: tagDetail(tag) });
})();
