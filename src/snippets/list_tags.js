/**
 * list_tags.js — List all tags in OmniFocus
 *
 * PASTE-TO-CONSOLE:
 *   Replace ARGS_PLACEHOLDER with: {} and run in OmniFocus Automation Console.
 *   Example: const args = {};
 */
(() => {
  const args = __ARGS__;
  void args; // no args needed for listing

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

  const tags = flattenedTags.map(function(t) {
    return {
      id: t.id.primaryKey,
      name: t.name,
      path: buildPath(t),
      parentId: t.parent ? t.parent.id.primaryKey : null,
      status: tagStatus(t),
    };
  });

  return JSON.stringify({ ok: true, data: tags });
})();
