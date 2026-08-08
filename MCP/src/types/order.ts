import type { OrderState } from "../generated/prisma/client.js";
import type { InvestigationCause } from "./investigation.js";

export interface StuckFulfilmentOrder {
  orderId: string;
  orderNumber: string;
  customerName: string;
  currentState: OrderState;
  cause: InvestigationCause;
  escalationReason: string;
}

export interface TimelineEntry {
  time: string;
  event: string;
}

export interface OrderTimeline {
  orderId: string;
  timeline: TimelineEntry[];
}

export interface ManagerReviewEscalationResult {
  orderId: string;
  escalationId: string;
  auditLogId: string;
  reason: string;
  createdAt: string;
}