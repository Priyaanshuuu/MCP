import { Prisma, OrderState } from "../generated/prisma/client.js";
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

export class OrderRepository {
  async listFulfilmentCandidates(): Promise<OrderWithFulfilment[]> {
    return prisma.order.findMany({
      where: {
        currentState: {
          in: [
            OrderState.PICKING,
            OrderState.PACKING,
            OrderState.AWAITING_CARRIER_HANDOFF,
          ],
        },
      },
      include: orderInclude,
      orderBy: {
        createdAt: "asc",
      },
    });
  }

  async getById(orderNumber: string): Promise<OrderWithFulfilment | null> {
    return prisma.order.findUnique({
      where: {
        orderNumber,
      },
      include: orderInclude,
    });
  }

  async createManagerReviewEscalation(orderNumber: string, reason: string) {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      select: { id: true },
    });

    if (!order) {
      throw new Error(`Order ${orderNumber} not found.`);
    }

    return prisma.$transaction(async (tx) => {
      const escalation = await tx.managerEscalation.create({
        data: {
          orderId: order.id,
          reason,
        },
      });

      const auditLog = await tx.auditLog.create({
        data: {
          orderId: order.id,
          action: "MANAGER_REVIEW_ESCALATION_CREATED",
          reason,
          createdBy: "MCP",
        },
      });

      return { escalation, auditLog };
    });
  }
}