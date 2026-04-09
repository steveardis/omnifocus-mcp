/**
 * delete_tag.js — Delete a tag by ID
 *
 * PASTE-TO-CONSOLE:
 *   Replace ARGS_PLACEHOLDER with: { id: "your-tag-id" }
 *   WARNING: Child tags are also permanently deleted.
 */
(() => {
  const args = __ARGS__;

  function NotFoundError(msg) { var e = new Error(msg); e.name = "NotFoundError"; return e; }

  var tag = flattenedTags.find(function(t) { return t.id.primaryKey === args.id; });
  if (!tag) throw new NotFoundError("Tag not found: " + args.id);

  var id = tag.id.primaryKey;
  deleteObject(tag);

  return JSON.stringify({ ok: true, data: { id: id } });
})();
