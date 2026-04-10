import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { allTools } from "./tools/index.js";

const server = new McpServer({
  name: "omnifocus-mcp",
  version: "0.1.0",
});

for (const tool of allTools) {
  // Unwrap ZodEffects from .refine() to get the underlying ZodObject.
  // The MCP SDK's zodToJsonSchema handles ZodObject correctly but not ZodEffects.
  const baseSchema =
    tool.inputSchema instanceof z.ZodEffects
      ? (tool.inputSchema._def.schema as z.AnyZodObject)
      : (tool.inputSchema as z.AnyZodObject);

  server.registerTool(
    tool.name,
    {
      description: tool.description,
      inputSchema: baseSchema,
    },
    async (args: Record<string, unknown>) => {
      try {
        const input = tool.inputSchema.parse(args);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await (tool.handler as (input: any) => Promise<unknown>)(input);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : String(err);
        return {
          content: [
            {
              type: "text" as const,
              text: `Error: ${message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}

const transport = new StdioServerTransport();
await server.connect(transport);
