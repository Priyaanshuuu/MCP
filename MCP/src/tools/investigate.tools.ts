import type { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";
import { OrderStatus } from "../generated/prisma/client.js";
import { InvestigationService } from "../services/investigation.service.js";
import { ROOT_CAUSES } from "../types/investigation.js";
import { toolError } from "./tool-result.js";

const investigationService = new InvestigationService();

const investigateOrderInput = z.object({
  orderId: z
    .string()
    .trim()
    .min(1)
    .describe("Identifier of the order to investigate, for example ORD-102."),
});

const investigateOrderOutput = z.object({
  orderId: z.string(),
  status: z.enum(OrderStatus),
  rootCause: z.enum(ROOT_CAUSES).describe("The single most likely blocker."),
  explanation: z.string().describe("Evidence for the diagnosis."),
  recommendation: z.string().describe("The suggested operational next step."),
});

export function registerInvestigationTools(server: McpServer): void {
  server.registerTool(
    "investigate_order",
    {
      title: "Investigate Order",
      description:
        "Diagnoses why a single order cannot proceed through fulfillment. Checks " +
        "payment, inventory and shipment in that order of priority and reports the " +
        "one root cause most likely to be blocking it, with evidence and a " +
        "recommended next step. Use this when asked why a specific order is stuck " +
        "or delayed. To find which orders are stuck in the first place, use " +
        "list_blocked_orders; for the history of an order, use get_order_timeline.",
      inputSchema: investigateOrderInput,
      outputSchema: investigateOrderOutput,
      annotations: { readOnlyHint: true },
    },
    async ({ orderId }) => {
      try {
        const investigation =
          await investigationService.investigateOrder(orderId);

        return {
          content: [{ type: "text", text: JSON.stringify(investigation) }],
          structuredContent: investigation,
        };
      } catch (error) {
        return toolError(error, "INVESTIGATION_FAILED");
      }
    },
  );
}
