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

  async getById(orderId: string): Promise<OrderWithFulfilment | null> {
    return prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: orderInclude,
    });
  }

  async createManagerReviewEscalation(orderId: string, reason: string) {
    return prisma.$transaction(async (tx) => {
      const escalation = await tx.managerEscalation.create({
        data: {
          orderId,
          reason,
        },
      });

      const auditLog = await tx.auditLog.create({
        data: {
          orderId,
          action: "MANAGER_REVIEW_ESCALATION_CREATED",
          reason,
          createdBy: "MCP",
        },
      });

      return { escalation, auditLog };
    });
  }
}