import assert from "node:assert/strict";
import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { after, before, describe, it } from "node:test";
import { createInterface } from "node:readline";

interface JsonRpcResponse {
  id?: number;
  result?: {
    tools?: { name: string }[];
    isError?: boolean;
    structuredContent?: Record<string, unknown>;
    content?: { type: string; text: string }[];
  };
  error?: { message: string };
}

/**
 * Drives the built server over stdio exactly as a real MCP client would, so the
 * transport, schema validation and registration are all exercised together.
 */
class StdioClient {
  private child!: ChildProcessWithoutNullStreams;
  private nextId = 1;
  private pending = new Map<number, (value: JsonRpcResponse) => void>();

  async start(): Promise<void> {
    this.child = spawn("node", ["build/index.js"], {
      stdio: ["pipe", "pipe", "pipe"],
    });

    createInterface({ input: this.child.stdout }).on("line", (line) => {
      if (!line.trim()) return;

      const message = JSON.parse(line) as JsonRpcResponse;
      if (message.id === undefined) return;

      this.pending.get(message.id)?.(message);
      this.pending.delete(message.id);
    });

    await this.request("initialize", {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "test", version: "1.0.0" },
    });

    this.notify("notifications/initialized");
  }

  request(method: string, params?: unknown): Promise<JsonRpcResponse> {
    const id = this.nextId++;

    return new Promise((resolve) => {
      this.pending.set(id, resolve);
      this.child.stdin.write(
        `${JSON.stringify({ jsonrpc: "2.0", id, method, params })}\n`,
      );
    });
  }

  notify(method: string): void {
    this.child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", method })}\n`);
  }

  callTool(name: string, args: unknown): Promise<JsonRpcResponse> {
    return this.request("tools/call", { name, arguments: args });
  }

  stop(): void {
    this.child.kill();
  }
}

const client = new StdioClient();

before(async () => {
  await client.start();
});

after(() => {
  client.stop();
});

describe("MCP server end to end", () => {
  it("advertises every registered tool", async () => {
    const response = await client.request("tools/list");
    const names = response.result?.tools?.map((tool) => tool.name) ?? [];

    assert.deepEqual(names.sort(), [
      "get_order_timeline",
      "investigate_order",
      "list_blocked_orders",
    ]);
  });

  it("returns a diagnosis through the full stack", async () => {
    const response = await client.callTool("investigate_order", {
      orderId: "ORD-102",
    });

    assert.notEqual(response.result?.isError, true);
    assert.equal(response.result?.structuredContent?.["rootCause"], "Payment Failed");
  });

  it("returns blocked orders through the full stack", async () => {
    const response = await client.callTool("list_blocked_orders", {});
    const orders = response.result?.structuredContent?.["orders"] as {
      orderId: string;
    }[];

    assert.deepEqual(
      orders.map((order) => order.orderId),
      ["ORD-102", "ORD-103", "ORD-104"],
    );
  });

  it("returns a structured error for an unknown order", async () => {
    const response = await client.callTool("investigate_order", {
      orderId: "ORD-999",
    });

    assert.equal(response.result?.isError, true);

    const payload = JSON.parse(response.result?.content?.[0]?.text ?? "{}") as {
      success: boolean;
      error: { code: string };
    };

    assert.equal(payload.success, false);
    assert.equal(payload.error.code, "ORDER_NOT_FOUND");
  });

  it("rejects an empty orderId before reaching the service", async () => {
    const response = await client.callTool("investigate_order", { orderId: "  " });

    assert.ok(
      response.error !== undefined || response.result?.isError === true,
      "expected a validation failure for a blank orderId",
    );
  });

  it("rejects a call with a missing orderId", async () => {
    const response = await client.callTool("get_order_timeline", {});

    assert.ok(
      response.error !== undefined || response.result?.isError === true,
      "expected a validation failure for a missing orderId",
    );
  });
});
