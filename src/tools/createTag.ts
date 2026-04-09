import { z } from "zod";
import { runSnippet } from "../runtime/index.js";
import { CreateTagInput, TagDetail } from "../schemas/index.js";

export type CreateTagInputType = z.infer<typeof CreateTagInput>;

export async function createTagHandler(
  input: CreateTagInputType
): Promise<z.infer<typeof TagDetail>> {
  const raw = await runSnippet("create_tag", input);
  return TagDetail.parse(raw);
}

export const createTagTool = {
  name: "create_tag",
  description:
    "Create a new OmniFocus tag. Omit parentTagId to create at the top level; provide parentTagId to nest it under an existing tag.",
  inputSchema: CreateTagInput,
  handler: createTagHandler,
} as const;
