import type { OrderStatus } from "../generated/prisma/client.js";

export interface BlockedOrder {
  orderId: string;
  customerName: string;
  status: OrderStatus;
}

export interface TimelineEntry {
  time: string;
  event: string;
}

export interface OrderTimeline {
  orderId: string;
  timeline: TimelineEntry[];
}
