import { Prisma, type OrderState } from "../generated/prisma/client.js";
import prisma from "../lib/prisma.js";

const orderInclude = {
  fulfilment: true,
  inventoryReservations: true,
  managerEscalations: true,
  auditLogs: true,
} satisfies Prisma.OrderInclude;

export type OrderWithFulfilment = Prisma.OrderGetPayload<{
  include: typeof orderInclude;
}>;

export interface OrderSummary {
  id: string;
  orderNumber: string;
  customerName: string;
  currentState: OrderState;
}

export class OrderRepository {
  async getById(orderId: string): Promise<OrderWithFulfilment | null> {
    return prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: orderInclude,
    });
  }
}