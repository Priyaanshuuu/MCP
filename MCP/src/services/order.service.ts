import { OrderStatus } from "../generated/prisma/client.js";
import { OrderRepository } from "../repositories/order.repository.js";
import type { BlockedOrder, OrderTimeline } from "../types/order.js";
import { OrderNotFoundError } from "./errors.js";

export class OrderService {
  constructor(private readonly orderRepository = new OrderRepository()) {}

  async listBlockedOrders(): Promise<BlockedOrder[]> {
    const orders = await this.orderRepository.getByStatus(OrderStatus.BLOCKED);

    return orders.map((order) => ({
      orderId: order.id,
      customerName: order.customerName,
      status: order.status,
    }));
  }

  async getOrderTimeline(orderId: string): Promise<OrderTimeline> {
    const order = await this.orderRepository.getById(orderId);

    if (!order) {
      throw new OrderNotFoundError(orderId);
    }

    return {
      orderId: order.id,
      timeline: order.timeline.map((entry) => ({
        time: entry.timestamp.toISOString(),
        event: entry.event,
      })),
    };
  }
}
