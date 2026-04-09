import { z } from "zod";
import { runSnippet } from "../runtime/index.js";
import { IdSchema, TagDetail } from "../schemas/index.js";

export const getTagSchema = z.object({
  id: IdSchema.describe("The tag's id.primaryKey"),
});

export type GetTagInput = z.infer<typeof getTagSchema>;

export async function getTagHandler(
  input: GetTagInput
): Promise<z.infer<typeof TagDetail>> {
  const raw = await runSnippet("get_tag", { id: input.id });
  return TagDetail.parse(raw);
}

export const getTagTool = {
  name: "get_tag",
  description:
    "Get full detail for a tag by its stable ID. Returns path, parentId, status, and child tag IDs.",
  inputSchema: getTagSchema,
  handler: getTagHandler,
} as const;
