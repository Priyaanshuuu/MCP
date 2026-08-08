import { OrderState } from "../generated/prisma/client.js";
import { OrderRepository, type OrderWithFulfilment } from "../repositories/order.repository.js";
import type {
  ManagerReviewEscalationResult,
  OrderTimeline,
  StuckFulfilmentOrder,
  TimelineEntry,
} from "../types/order.js";
import type { InvestigationResult } from "../types/investigation.js";
import { InvestigationService } from "./investigation.service.js";
import { OrderNotFoundError } from "./errors.js";

export class OrderService {
  constructor(
    private readonly orderRepository = new OrderRepository(),
    private readonly investigationService = new InvestigationService(),
  ) {}

  async listStuckFulfilmentOrders(): Promise<StuckFulfilmentOrder[]> {
    const candidates = await this.orderRepository.listFulfilmentCandidates();

    const investigated = await Promise.all(
      candidates.map(async (order) => ({
        order,
        investigation: await this.investigationService.investigateOrder(order.id),
      })),
    );

    return investigated
      .filter(({ investigation }) => investigation.requiresManagerReview)
      .map(({ order, investigation }) => ({
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        currentState: order.currentState,
        cause: investigation.cause,
        escalationReason: investigation.escalationReason ?? "Manager review required.",
      }));
  }

  async getOrderTimeline(orderId: string): Promise<OrderTimeline> {
    const order = await this.orderRepository.getById(orderId);

    if (!order) {
      throw new OrderNotFoundError(orderId);
    }

    return {
      orderId: order.id,
      timeline: buildTimeline(order),
    };
  }

  async createManagerReviewEscalation(
    orderId: string,
  ): Promise<ManagerReviewEscalationResult> {
    const investigation = await this.investigationService.investigateOrder(orderId);

    if (!investigation.requiresManagerReview || !investigation.escalationReason) {
      throw new Error("Manager review is not required for this order.");
    }

    const result = await this.orderRepository.createManagerReviewEscalation(
      orderId,
      investigation.escalationReason,
    );

    return {
      orderId,
      escalationId: result.escalation.id,
      auditLogId: result.auditLog.id,
      reason: result.escalation.reason,
      createdAt: result.escalation.createdAt.toISOString(),
    };
  }
}

function buildTimeline(order: OrderWithFulfilment): TimelineEntry[] {
  const timeline: TimelineEntry[] = [
    {
      time: order.createdAt.toISOString(),
      event: "Order created",
    },
  ];

  const fulfilment = order.fulfilment;

  if (fulfilment?.pickingStartedAt) {
    timeline.push({
      time: fulfilment.pickingStartedAt.toISOString(),
      event: "Picking started",
    });
  }

  if (fulfilment?.pickedAt) {
    timeline.push({
      time: fulfilment.pickedAt.toISOString(),
      event: "Picking completed",
    });
  }

  if (fulfilment?.packingStartedAt) {
    timeline.push({
      time: fulfilment.packingStartedAt.toISOString(),
      event: "Packing started",
    });
  }

  if (fulfilment?.packedAt) {
    timeline.push({
      time: fulfilment.packedAt.toISOString(),
      event: "Packing completed",
    });
  }

  if (fulfilment?.carrierHandoffRequestedAt) {
    timeline.push({
      time: fulfilment.carrierHandoffRequestedAt.toISOString(),
      event: "Carrier handoff requested",
    });
  }

  if (fulfilment?.carrierHandoffCompletedAt) {
    timeline.push({
      time: fulfilment.carrierHandoffCompletedAt.toISOString(),
      event: "Carrier handoff completed",
    });
  }

  if (fulfilment?.dispatchedAt) {
    timeline.push({
      time: fulfilment.dispatchedAt.toISOString(),
      event: "Dispatched",
    });
  }

  for (const escalation of order.managerEscalations) {
    timeline.push({
      time: escalation.createdAt.toISOString(),
      event: "Manager review escalation created",
    });
  }

  for (const auditLog of order.auditLogs) {
    timeline.push({
      time: auditLog.timestamp.toISOString(),
      event: auditLog.action,
    });
  }

  return timeline.sort((left, right) => left.time.localeCompare(right.time));
}