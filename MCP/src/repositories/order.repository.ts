import { Prisma } from "../generated/prisma/client.js";
import prisma from "../lib/prisma.js";

/**
 * Relations every order query returns, so `getAll` and `getById`
 * always produce the same shape.
 */
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

export class OrderRepository {
  async getAll(): Promise<OrderWithRelations[]> {
    return prisma.order.findMany({
      include: orderInclude,
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
