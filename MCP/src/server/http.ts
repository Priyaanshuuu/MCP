import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/server";
import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import { createMcpServer } from "./mcp.js";

const MCP_PATH = "/mcp";
const MAX_BODY_BYTES = 1024 * 1024;

const allowedOrigins = (process.env["MCP_ALLOWED_ORIGINS"] ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export function startHttpServer(port: number, host: string): void {
  const httpServer = createServer((req, res) => {
    handleRequest(req, res).catch((error: unknown) => {
      console.error("Unhandled request error:", error);
      if (!res.headersSent) {
        sendJson(res, 500, { error: "Internal server error" });
      }
      res.end();
    });
  });

  httpServer.listen(port, host, () => {
    console.error(`MCP server listening on http://${host}:${port}${MCP_PATH}`);
  });
}

async function handleRequest(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  const host = req.headers.host ?? "localhost";
  const url = new URL(req.url ?? "/", `http://${host}`);

  if (url.pathname === "/health") {
    sendJson(res, 200, { status: "ok" });
    return;
  }

  if (url.pathname !== MCP_PATH) {
    sendJson(res, 404, { error: "Not found" });
    return;
  }

  const origin = req.headers.origin;
  if (origin && allowedOrigins.length > 0 && !allowedOrigins.includes(origin)) {
    sendJson(res, 403, { error: "Origin not allowed" });
    return;
  }

  const body = await readBody(req);
  if (body === null) {
   
    req.destroy();
    sendJson(res, 413, { error: "Request body too large" });
    return;
  }

  const server = createMcpServer();
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  res.on("close", () => {
    void transport.close();
    void server.close();
  });

  await server.connect(transport);

  const response = await transport.handleRequest(toWebRequest(req, url, body));

  await writeResponse(res, response);
}

function toWebRequest(
  req: IncomingMessage,
  url: URL,
  body: Buffer,
): Request {
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) {
      for (const item of value) headers.append(key, item);
    } else if (value !== undefined) {
      headers.set(key, value);
    }
  }

  const method = req.method ?? "GET";
  const hasBody = method !== "GET" && method !== "HEAD" && body.length > 0;

  return new Request(url, {
    method,
    headers,
    ...(hasBody ? { body: new Uint8Array(body) } : {}),
  });
}

async function readBody(req: IncomingMessage): Promise<Buffer | null> {
  const chunks: Buffer[] = [];
  let size = 0;

  for await (const chunk of req) {
    size += (chunk as Buffer).length;
    if (size > MAX_BODY_BYTES) return null;
    chunks.push(chunk as Buffer);
  }

  return Buffer.concat(chunks);
}

async function writeResponse(
  res: ServerResponse,
  response: Response,
): Promise<void> {
  res.writeHead(response.status, Object.fromEntries(response.headers));

  if (!response.body) {
    res.end();
    return;
  }

  const reader = response.body.getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    res.write(value);
  }

  res.end();
}

function sendJson(
  res: ServerResponse,
  status: number,
  payload: unknown,
): void {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(payload));
}
