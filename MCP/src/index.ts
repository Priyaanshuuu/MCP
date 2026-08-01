import { startMcpServer } from "./server/mcp.js";

// stdout carries the MCP protocol, so all diagnostics must go to stderr.
startMcpServer()
  .then(() => {
    console.error("Commerce Operations Copilot MCP server running on stdio.");
  })
  .catch((error: unknown) => {
    console.error("Fatal error while starting the MCP server:", error);
    process.exit(1);
  });
