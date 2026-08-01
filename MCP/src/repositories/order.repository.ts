import { Prisma, type OrderStatus } from "../generated/prisma/client.js";
import prisma from "../lib/prisma.js";

const orderInclude = {
  payment: true,
  shipment: true,
  items: {
    include: {
      inventory: true,
    },
  },
  timeline: {
    orderBy: {
      timestamp: "asc",
    },
  },
} satisfies Prisma.OrderInclude;

export type OrderWithRelations = Prisma.OrderGetPayload<{
  include: typeof orderInclude;
}>;

export interface OrderSummary {
  id: string;
  customerName: string;
  status: OrderStatus;
}

export class OrderRepository {
  /** Lean projection: list views never need payment, items or timeline. */
  async getByStatus(status: OrderStatus): Promise<OrderSummary[]> {
    return prisma.order.findMany({
      where: {
        status,
      },
      select: {
        id: true,
        customerName: true,
        status: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }

  async getById(orderId: string): Promise<OrderWithRelations | null> {
    return prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: orderInclude,
    });
  }
}
