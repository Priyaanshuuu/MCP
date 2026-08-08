import type { CallToolResult } from "@modelcontextprotocol/server";
import { OrderNotFoundError } from "../services/errors.js";

export function toolError(
  error: unknown,
  fallbackCode: string,
): CallToolResult {
  if (error instanceof OrderNotFoundError) {
    return envelope("ORDER_NOT_FOUND", error.message);
  }

  const message = error instanceof Error ? error.message : String(error);
  console.error("Tool failure:", message, error);

  return envelope(fallbackCode, message || "The request could not be completed.");
}

function envelope(code: string, message: string): CallToolResult {
  return {
    isError: true,
    content: [
      {
        type: "text",
        text: JSON.stringify({ success: false, error: { code, message } }),
      },
    ],
  };
}
