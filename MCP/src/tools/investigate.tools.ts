import type { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";
import { OrderStatus } from "../generated/prisma/client.js";
import { InvestigationService } from "../services/investigation.service.js";
import { ROOT_CAUSES } from "../types/investigation.js";
import { toolError } from "./tool-result.js";

const investigationService = new InvestigationService();

const inputSchema = z.object({
  orderId: z
    .string()
    .trim()
    .min(1)
    .describe("Identifier of the order to investigate, for example ORD-102."),
});

const outputSchema = z.object({
  orderId: z.string(),
  status: z.enum(OrderStatus),
  rootCause: z.enum(ROOT_CAUSES),
  explanation: z.string(),
  recommendation: z.string(),
});

export function registerInvestigationTools(server: McpServer): void {
  server.registerTool(
    "investigate_order",
    {
      title: "Investigate Order",
      description:
        "Investigates an order across payment, inventory, and shipment systems " +
        "to determine the primary reason it cannot proceed through fulfillment.",
      inputSchema,
      outputSchema,
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
        return toolError("ORDER_NOT_FOUND", error);
      }
    },
  );
}
