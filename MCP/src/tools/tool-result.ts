import type { CallToolResult } from "@modelcontextprotocol/server";
import { OrderNotFoundError } from "../services/errors.js";

/**
 * Structured failure envelope so the model can explain errors consistently.
 *
 * Expected failures keep their specific code and message. Anything unexpected is
 * logged to stderr and reported generically, so internal details never reach the
 * model and a system fault is never mistaken for a missing order.
 */
export function toolError(
  error: unknown,
  fallbackCode: string,
): CallToolResult {
  if (error instanceof OrderNotFoundError) {
    return envelope("ORDER_NOT_FOUND", error.message);
  }

  console.error("Tool failure:", error);

  return envelope(fallbackCode, "The request could not be completed.");
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
