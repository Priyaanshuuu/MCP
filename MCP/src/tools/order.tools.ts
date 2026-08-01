import type { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";
import { OrderStatus } from "../generated/prisma/client.js";
import { OrderService } from "../services/order.service.js";
import { toolError } from "./tool-result.js";

const orderService = new OrderService();

const orderIdSchema = z.object({
  orderId: z
    .string()
    .trim()
    .min(1)
    .describe("Identifier of the order, for example ORD-102."),
});

const blockedOrdersOutputSchema = z.object({
  orders: z.array(
    z.object({
      orderId: z.string(),
      customerName: z.string(),
      status: z.enum(OrderStatus),
    }),
  ),
});

const timelineOutputSchema = z.object({
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
        "Use this to find which orders need operational attention. It reports that an " +
        "order is blocked but not why — call investigate_order for a specific order to " +
        "determine the root cause.",
      inputSchema: z.object({}),
      outputSchema: blockedOrdersOutputSchema,
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
        return toolError("BLOCKED_ORDERS_LOOKUP_FAILED", error);
      }
    },
  );

  server.registerTool(
    "get_order_timeline",
    {
      title: "Get Order Timeline",
      description:
        "Returns the chronological lifecycle events recorded for a single order — " +
        "creation, payment, fulfillment and delivery — oldest first. Use this to explain " +
        "what has happened to an order over time; use investigate_order instead to " +
        "diagnose why it is currently stuck.",
      inputSchema: orderIdSchema,
      outputSchema: timelineOutputSchema,
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
        return toolError("ORDER_NOT_FOUND", error);
      }
    },
  );
}
