import { z } from "zod";
import { runSnippet } from "../runtime/index.js";
import { EntityType, ResolveCandidate } from "../schemas/index.js";

export const resolveNameSchema = z.object({
  type: EntityType.describe(
    "The entity type to search: task, project, folder, tag, or perspective"
  ),
  query: z.string().min(1).describe("Exact name to search for"),
  scope: z
    .string()
    .optional()
    .describe(
      'Optional path prefix to narrow results, e.g. "Work ▸ Clients"'
    ),
});

export type ResolveNameInput = z.infer<typeof resolveNameSchema>;

export async function resolveNameHandler(
  input: ResolveNameInput
): Promise<z.infer<typeof ResolveCandidate>[]> {
  const raw = await runSnippet("resolve_name", {
    type: input.type,
    query: input.query,
    scope: input.scope ?? null,
  });
  return z.array(ResolveCandidate).parse(raw);
}

export const resolveNameTool = {
  name: "resolve_name",
  description:
    "Resolve an entity name to its stable ID(s). Returns ALL matches — never silently picks one. If multiple candidates are returned, ask the user or caller to disambiguate using the path field before proceeding with a write operation.",
  inputSchema: resolveNameSchema,
  handler: resolveNameHandler,
} as const;
