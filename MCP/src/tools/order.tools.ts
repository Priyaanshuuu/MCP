import type { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";
import { OrderState } from "../generated/prisma/client.js";
import { OrderService } from "../services/order.service.js";
import { toolError } from "./tool-result.js";

const orderService = new OrderService();

const emptyInput = z.object({});

const stuckOrderSchema = z.object({
  orderId: z.string(),
  orderNumber: z.string(),
  customerName: z.string(),
  currentState: z.nativeEnum(OrderState),
  cause: z.enum([
    "PICKING_DELAY",
    "PACKING_DELAY",
    "CARRIER_HANDOFF_DELAY",
    "NO_DELAY",
  ]),
  escalationReason: z.string(),
});

const getOrderTimelineInput = z.object({
  orderId: z
    .string()
    .trim()
    .min(1)
    .describe("Identifier of the order, for example FO-1004."),
});

const getOrderTimelineOutput = z.object({
  orderId: z.string(),
  timeline: z.array(
    z.object({
      time: z.string(),
      event: z.string(),
    }),
  ),
});

const createEscalationInput = z.object({
  orderId: z
    .string()
    .trim()
    .min(1)
    .describe("Identifier of the order requiring manager review."),
});

const createEscalationOutput = z.object({
  orderId: z.string(),
  escalationId: z.string(),
  auditLogId: z.string(),
  reason: z.string(),
  createdAt: z.string(),
});

export function registerOrderTools(server: McpServer): void {
  server.registerTool(
    "list_stuck_fulfilment_orders",
    {
      title: "List Stuck Fulfilment Orders",
      description:
        "Lists fulfilment orders that have exceeded SLA thresholds and require manager review.",
      inputSchema: emptyInput,
      outputSchema: z.object({ orders: z.array(stuckOrderSchema) }),
      annotations: { readOnlyHint: true },
    },
    async () => {
      try {
        const orders = await orderService.listStuckFulfilmentOrders();

        return {
          content: [{ type: "text", text: JSON.stringify({ orders }) }],
          structuredContent: { orders },
        };
      } catch (error) {
        return toolError(error, "STUCK_FULFILMENT_ORDERS_LOOKUP_FAILED");
      }
    },
  );

  server.registerTool(
    "get_order_timeline",
    {
      title: "Get Order Timeline",
      description:
        "Returns the fulfilment timeline for a single order, including any manager review escalations.",
      inputSchema: getOrderTimelineInput,
      outputSchema: getOrderTimelineOutput,
      annotations: { readOnlyHint: true },
    },
    async ({ orderId }) => {
      try {
        const timeline = await orderService.getOrderTimeline(orderId);

        return {
          content: [{ type: "text", text: JSON.stringify(timeline) }],
          structuredContent: timeline,
        };
      } catch (error) {
        return toolError(error, "TIMELINE_LOOKUP_FAILED");
      }
    },
  );

  server.registerTool(
    "create_manager_review_escalation",
    {
      title: "Create Manager Review Escalation",
      description:
        "Creates the only permitted write action: a manager review escalation plus audit log record for a stuck fulfilment order.",
      inputSchema: createEscalationInput,
      outputSchema: createEscalationOutput,
      annotations: { readOnlyHint: false },
    },
    async ({ orderId }) => {
      try {
        const escalation = await orderService.createManagerReviewEscalation(orderId);

        return {
          content: [{ type: "text", text: JSON.stringify(escalation) }],
          structuredContent: escalation,
        };
      } catch (error) {
        return toolError(error, "MANAGER_REVIEW_ESCALATION_CREATE_FAILED");
      }
    },
  );
}