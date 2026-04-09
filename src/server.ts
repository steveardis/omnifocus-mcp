import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { allTools } from "./tools/index.js";

const server = new McpServer({
  name: "omnifocus-mcp",
  version: "0.1.0",
});

for (const tool of allTools) {
  // Extract the shape from the zod object schema for registerTool
  const inputShape = (tool.inputSchema as z.AnyZodObject).shape;

  server.registerTool(
    tool.name,
    {
      description: tool.description,
      inputSchema: inputShape,
    },
    async (args: Record<string, unknown>) => {
      try {
        // Validate input (already parsed by MCP SDK, re-parse for our shape)
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
