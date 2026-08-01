import { startHttpServer } from "./server/http.js";
import { startMcpServer } from "./server/mcp.js";


if (process.env["MCP_TRANSPORT"] === "http") {
  const port = Number(process.env["PORT"] ?? 3000);
  const host = process.env["HOST"] ?? "0.0.0.0";

  startHttpServer(port, host);
} else {
  startMcpServer()
    .then(() => {
      console.error("Commerce Operations Copilot MCP server running on stdio.");
    })
    .catch((error: unknown) => {
      console.error("Fatal error while starting the MCP server:", error);
      process.exit(1);
    });
}
