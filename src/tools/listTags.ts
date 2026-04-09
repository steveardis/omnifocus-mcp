import { z } from "zod";
import { runSnippet } from "../runtime/index.js";
import { TagSummary } from "../schemas/index.js";

export const listTagsSchema = z.object({});

export type ListTagsInput = z.infer<typeof listTagsSchema>;

export async function listTagsHandler(
  _input: ListTagsInput
): Promise<z.infer<typeof TagSummary>[]> {
  const raw = await runSnippet("list_tags", {});
  return z.array(TagSummary).parse(raw);
}

export const listTagsTool = {
  name: "list_tags",
  description:
    "List all tags in OmniFocus. Returns id, name, full path (ancestors joined with ▸), parentId, and status for every tag.",
  inputSchema: listTagsSchema,
  handler: listTagsHandler,
} as const;
