import type { CallToolResult } from "@modelcontextprotocol/server";

/** Structured failure envelope so the model can explain errors consistently. */
export function toolError(code: string, error: unknown): CallToolResult {
  const message =
    error instanceof Error ? error.message : "Unexpected tool failure.";

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
