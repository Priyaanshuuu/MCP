import type { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";
import { OrderStatus } from "../generated/prisma/client.js";
import { OrderService } from "../services/order.service.js";
import { toolError } from "./tool-result.js";

const orderService = new OrderService();

const listBlockedOrdersInput = z.object({});

const listBlockedOrdersOutput = z.object({
  orders: z.array(
    z.object({
      orderId: z.string(),
      customerName: z.string(),
      status: z.enum(OrderStatus),
    }),
  ),
});

const getOrderTimelineInput = z.object({
  orderId: z
    .string()
    .trim()
    .min(1)
    .describe("Identifier of the order, for example ORD-102."),
});

const getOrderTimelineOutput = z.object({
  orderId: z.string(),
  timeline: z.array(
    z.object({
      time: z.string().describe("ISO 8601 timestamp of the event."),
      event: z.string(),
    }),
  ),
});

export function registerOrderTools(server: McpServer): void {
  server.registerTool(
    "list_blocked_orders",
    {
      title: "List Blocked Orders",
      description:
        "Lists every order currently held in BLOCKED status, with the customer name. " +
        "Use this to answer questions about which orders need attention, how many are " +
        "stuck, or which customers are affected. It reports that an order is blocked " +
        "but not why — call investigate_order for a specific order to get the cause. " +
        "Takes no arguments and returns an empty list when nothing is blocked.",
      inputSchema: listBlockedOrdersInput,
      outputSchema: listBlockedOrdersOutput,
      annotations: { readOnlyHint: true },
    },
    async () => {
      try {
        const orders = await orderService.listBlockedOrders();

        return {
          content: [{ type: "text", text: JSON.stringify({ orders }) }],
          structuredContent: { orders },
        };
      } catch (error) {
        return toolError(error, "BLOCKED_ORDERS_LOOKUP_FAILED");
      }
    },
  );

  server.registerTool(
    "get_order_timeline",
    {
      title: "Get Order Timeline",
      description:
        "Returns the recorded lifecycle events for a single order — creation, payment, " +
        "fulfillment and delivery — oldest first. Use this to answer what happened to " +
        "an order and when. It reports history, not diagnosis: use investigate_order " +
        "to determine why an order is currently stuck.",
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
}
