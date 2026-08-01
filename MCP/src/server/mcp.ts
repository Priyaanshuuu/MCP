import { McpServer } from "@modelcontextprotocol/server";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import { registerInvestigationTools } from "../tools/investigate.tools.js";

export const server = new McpServer({
  name: "commerce-operations-copilot",
  version: "1.0.0",
});

registerInvestigationTools(server);

export async function startMcpServer(): Promise<void> {
  await server.connect(new StdioServerTransport());
}
