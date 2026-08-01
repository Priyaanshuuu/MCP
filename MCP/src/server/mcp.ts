import { McpServer } from "@modelcontextprotocol/server";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import { registerInvestigationTools } from "../tools/investigate.tools.js";

export function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "commerce-operations-copilot",
    version: "1.0.0",
  });

  registerInvestigationTools(server);

  return server;
}

export async function startMcpServer(): Promise<void> {
  await createMcpServer().connect(new StdioServerTransport());
}
