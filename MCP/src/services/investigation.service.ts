import { PaymentStatus, ShipmentStatus } from "../generated/prisma/client.js";
import {
  OrderRepository,
  type OrderWithRelations,
} from "../repositories/order.repository.js";
import type { Diagnosis, InvestigationResult } from "../types/investigation.js";
import { OrderNotFoundError } from "./errors.js";

export class InvestigationService {
  constructor(private readonly orderRepository = new OrderRepository()) {}

  async investigateOrder(orderId: string): Promise<InvestigationResult> {
    const order = await this.orderRepository.getById(orderId);

    if (!order) {
      throw new OrderNotFoundError(orderId);
    }

    return {
      orderId: order.id,
      status: order.status,
      ...diagnose(order),
    };
  }
}

function diagnose(order: OrderWithRelations): Diagnosis {
  if (order.payment?.status === PaymentStatus.FAILED) {
    return {
      rootCause: "Payment Failed",
      explanation:
        order.payment.failureReason ?? "Payment could not be processed.",
      recommendation:
        "Retry the payment or ask the customer to use another payment method.",
    };
  }

  if (order.payment?.status === PaymentStatus.PENDING) {
    return {
      rootCause: "Payment Pending",
      explanation: "Payment has been initiated but has not settled yet.",
      recommendation:
        "Check the payment gateway for the authorisation result before fulfilling.",
    };
  }

  const shortItem = order.items.find(
    (item) => item.inventory.available < item.quantity,
  );

  if (shortItem) {
    return {
      rootCause: "Inventory Unavailable",
      explanation: `SKU ${shortItem.sku} has ${shortItem.inventory.available} in stock but the order requires ${shortItem.quantity}.`,
      recommendation: "Restock the inventory before creating the shipment.",
    };
  }

  if (
    order.payment?.status === PaymentStatus.SUCCESS &&
    order.shipment?.status === ShipmentStatus.NOT_CREATED
  ) {
    return {
      rootCause: "Shipment Not Created",
      explanation: "Payment is complete but no shipment has been created.",
      recommendation: "Create the shipment and assign a fulfillment carrier.",
    };
  }

  return {
    rootCause: "No Issues Found",
    explanation: "No operational issues were detected for this order.",
    recommendation: "Continue the normal fulfillment process.",
  };
}
