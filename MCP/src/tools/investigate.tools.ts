import type { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";
import { OrderState } from "../generated/prisma/client.js";
import { InvestigationService } from "../services/investigation.service.js";
import { toolError } from "./tool-result.js";

const investigationService = new InvestigationService();

const investigateOrderInput = z.object({
  orderId: z
    .string()
    .trim()
    .min(1)
    .describe("Identifier of the order to investigate, for example FO-1004."),
});

const evidenceSchema = z.object({
  checkpoint: z.enum(["picking", "packing", "carrier_handoff"]),
  thresholdHours: z.number(),
  elapsedHours: z.number(),
  exceeded: z.boolean(),
  startedAt: z.string().nullable(),
  completedAt: z.string().nullable(),
});

const investigateOrderOutput = z.object({
  orderId: z.string(),
  currentState: z.nativeEnum(OrderState),
  evidence: z.array(evidenceSchema),
  cause: z.enum([
    "PICKING_DELAY",
    "PACKING_DELAY",
    "CARRIER_HANDOFF_DELAY",
    "NO_DELAY",
  ]),
  proposedNextAction: z.string(),
  requiresManagerReview: z.boolean(),
  escalationReason: z.string().nullable(),
});

export function registerInvestigationTools(server: McpServer): void {
  server.registerTool(
    "investigate_order",
    {
      title: "Investigate Order",
      description:
        "Returns structured fulfilment investigation data for a single order. Use this to inspect delay evidence, determine whether manager review is required, and decide whether to create an escalation.",
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