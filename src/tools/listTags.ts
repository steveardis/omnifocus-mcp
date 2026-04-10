import { z } from "zod";
import { runSnippet } from "../runtime/index.js";
import { TagSummary, ListTagsFilter } from "../schemas/index.js";

export const listTagsSchema = z.object({
  filter: ListTagsFilter.optional().describe(
    "Optional filter. When status is provided, only tags with that status are returned. When omitted, all tags (active, onHold, and dropped) are returned."
  ),
  limit: z.number().int().positive().optional().describe(
    "Maximum number of tags to return. Defaults to 200."
  ),
});

export type ListTagsInput = z.infer<typeof listTagsSchema>;

export async function listTagsHandler(
  input: ListTagsInput
): Promise<z.infer<typeof TagSummary>[]> {
  const raw = await runSnippet("list_tags", {
    filter: input.filter,
    limit: input.limit,
  });
  return z.array(TagSummary).parse(raw);
}

export const listTagsTool = {
  name: "list_tags",
  description:
    "List tags in OmniFocus. By default, all tags (active, onHold, and dropped) are returned. Optional filter.status ('active' | 'onHold' | 'dropped') restricts to that status. Results are capped at limit (default 200). Each tag includes id, name, full path (ancestors joined with ▸), parentId, and status.",
  inputSchema: listTagsSchema,
  handler: listTagsHandler,
} as const;
