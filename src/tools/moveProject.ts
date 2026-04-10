import { z } from "zod";
import { runSnippet } from "../runtime/index.js";
import { MoveProjectInput, ProjectSummary } from "../schemas/index.js";

export type MoveProjectInputType = z.infer<typeof MoveProjectInput>;

export async function moveProjectHandler(
  input: MoveProjectInputType
): Promise<z.infer<typeof ProjectSummary>> {
  const raw = await runSnippet("move_project", input);
  return ProjectSummary.parse(raw);
}

export const moveProjectTool = {
  name: "move_project",
  description:
    "Move a project to a different folder or to the top level. Pass folderId as a string to move into a folder, or null to move to the top level. Throws a not-found error if either ID does not exist.",
  inputSchema: MoveProjectInput,
  handler: moveProjectHandler,
} as const;
