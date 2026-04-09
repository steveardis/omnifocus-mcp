import { z } from "zod";
import { runSnippet } from "../runtime/index.js";
import { EditTagInput, TagDetail } from "../schemas/index.js";

export type EditTagInputType = z.infer<typeof EditTagInput>;

export async function editTagHandler(
  input: EditTagInputType
): Promise<z.infer<typeof TagDetail>> {
  const raw = await runSnippet("edit_tag", input);
  return TagDetail.parse(raw);
}

export const editTagTool = {
  name: "edit_tag",
  description:
    "Edit an existing OmniFocus tag. Provide id plus any combination of name (rename) and status (active/onHold/dropped).",
  inputSchema: EditTagInput,
  handler: editTagHandler,
} as const;
