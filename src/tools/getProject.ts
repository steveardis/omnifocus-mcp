import { z } from "zod";
import { runSnippet } from "../runtime/index.js";
import { IdSchema, ProjectDetail } from "../schemas/index.js";

export const getProjectSchema = z.object({
  id: IdSchema.describe("The project's id.primaryKey"),
});

export type GetProjectInput = z.infer<typeof getProjectSchema>;

export async function getProjectHandler(
  input: GetProjectInput
): Promise<z.infer<typeof ProjectDetail>> {
  const raw = await runSnippet("get_project", { id: input.id });
  return ProjectDetail.parse(raw);
}

export const getProjectTool = {
  name: "get_project",
  description:
    "Get full detail for a project by its stable ID. Returns note, folder path, status, type, dates, review metadata, and tag IDs.",
  inputSchema: getProjectSchema,
  handler: getProjectHandler,
} as const;
