import { OrderState } from "../generated/prisma/client.js";
import { OrderRepository, type OrderWithFulfilment } from "../repositories/order.repository.js";
import type {
  InvestigationCause,
  InvestigationEvidenceItem,
  InvestigationResult,
} from "../types/investigation.js";
import { FULFILMENT_SLA_HOURS } from "./fulfillment_rules.js";
import { OrderNotFoundError } from "./errors.js";

const MS_PER_HOUR = 60 * 60 * 1000;

export class InvestigationService {
  constructor(private readonly orderRepository = new OrderRepository()) {}

  async investigateOrder(orderId: string): Promise<InvestigationResult> {
    const order = await this.orderRepository.getById(orderId);

    if (!order) {
      throw new OrderNotFoundError(orderId);
    }

    const now = new Date();
    const evidence = buildEvidence(order, now);
    const finding = determineFinding(order, now, evidence);

    return {
      orderId: order.id,
      currentState: order.currentState,
      evidence,
      cause: finding.cause,
      proposedNextAction: finding.proposedNextAction,
      requiresManagerReview: finding.requiresManagerReview,
      escalationReason: finding.escalationReason,
    };
  }
}

function determineFinding(
  order: OrderWithFulfilment,
  now: Date,
  evidence: InvestigationEvidenceItem[],
): {
  cause: InvestigationCause;
  proposedNextAction: string;
  requiresManagerReview: boolean;
  escalationReason: string | null;
} {
  const fulfilment = order.fulfilment;

  if (
    order.currentState === OrderState.PICKING &&
    fulfilment?.pickingStartedAt &&
    !fulfilment.pickedAt &&
    hoursSince(fulfilment.pickingStartedAt, null, now) >
      FULFILMENT_SLA_HOURS.picking
  ) {
    return {
      cause: "PICKING_DELAY",
      proposedNextAction: "CREATE_MANAGER_REVIEW_ESCALATION",
      requiresManagerReview: true,
      escalationReason: "Picking has exceeded the 8 hour SLA.",
    };
  }

  if (
    order.currentState === OrderState.PACKING &&
    fulfilment?.packingStartedAt &&
    !fulfilment.packedAt &&
    hoursSince(fulfilment.packingStartedAt, null, now) >
      FULFILMENT_SLA_HOURS.packing
  ) {
    return {
      cause: "PACKING_DELAY",
      proposedNextAction: "CREATE_MANAGER_REVIEW_ESCALATION",
      requiresManagerReview: true,
      escalationReason: "Packing has exceeded the additional 4 hour SLA.",
    };
  }

  if (
    order.currentState === OrderState.AWAITING_CARRIER_HANDOFF &&
    fulfilment?.carrierHandoffRequestedAt &&
    !fulfilment.carrierHandoffCompletedAt &&
    hoursSince(fulfilment.carrierHandoffRequestedAt, null, now) >
      FULFILMENT_SLA_HOURS.carrierHandoff
  ) {
    return {
      cause: "CARRIER_HANDOFF_DELAY",
      proposedNextAction: "CREATE_MANAGER_REVIEW_ESCALATION",
      requiresManagerReview: true,
      escalationReason: "Carrier handoff has exceeded the 48 hour SLA.",
    };
  }

  const activeCause = evidence.find((item) => item.exceeded)?.checkpoint;

  if (activeCause === "picking") {
    return {
      cause: "PICKING_DELAY",
      proposedNextAction: "CREATE_MANAGER_REVIEW_ESCALATION",
      requiresManagerReview: true,
      escalationReason: "Picking has exceeded the 8 hour SLA.",
    };
  }

  if (activeCause === "packing") {
    return {
      cause: "PACKING_DELAY",
      proposedNextAction: "CREATE_MANAGER_REVIEW_ESCALATION",
      requiresManagerReview: true,
      escalationReason: "Packing has exceeded the additional 4 hour SLA.",
    };
  }

  if (activeCause === "carrier_handoff") {
    return {
      cause: "CARRIER_HANDOFF_DELAY",
      proposedNextAction: "CREATE_MANAGER_REVIEW_ESCALATION",
      requiresManagerReview: true,
      escalationReason: "Carrier handoff has exceeded the 48 hour SLA.",
    };
  }

  return {
    cause: "NO_DELAY",
    proposedNextAction: "CONTINUE_MONITORING",
    requiresManagerReview: false,
    escalationReason: null,
  };
}

function buildEvidence(
  order: OrderWithFulfilment,
  now: Date,
): InvestigationEvidenceItem[] {
  const fulfilment = order.fulfilment;
  const pickingStartedAt = fulfilment?.pickingStartedAt;
  const pickedAt = fulfilment?.pickedAt;
  const packingStartedAt = fulfilment?.packingStartedAt;
  const packedAt = fulfilment?.packedAt;
  const carrierHandoffRequestedAt = fulfilment?.carrierHandoffRequestedAt;
  const carrierHandoffCompletedAt = fulfilment?.carrierHandoffCompletedAt;

  return [
    {
      checkpoint: "picking",
      thresholdHours: FULFILMENT_SLA_HOURS.picking,
      elapsedHours: hoursSince(pickingStartedAt, pickedAt, now),
      exceeded:
        Boolean(pickingStartedAt) &&
        order.currentState === OrderState.PICKING &&
        !pickedAt &&
        hoursSince(pickingStartedAt, null, now) > FULFILMENT_SLA_HOURS.picking,
      startedAt: pickingStartedAt?.toISOString() ?? null,
      completedAt: pickedAt?.toISOString() ?? null,
    },
    {
      checkpoint: "packing",
      thresholdHours: FULFILMENT_SLA_HOURS.packing,
      elapsedHours: hoursSince(packingStartedAt, packedAt, now),
      exceeded:
        Boolean(packingStartedAt) &&
        order.currentState === OrderState.PACKING &&
        !packedAt &&
        hoursSince(packingStartedAt, null, now) > FULFILMENT_SLA_HOURS.packing,
      startedAt: packingStartedAt?.toISOString() ?? null,
      completedAt: packedAt?.toISOString() ?? null,
    },
    {
      checkpoint: "carrier_handoff",
      thresholdHours: FULFILMENT_SLA_HOURS.carrierHandoff,
      elapsedHours: hoursSince(carrierHandoffRequestedAt, carrierHandoffCompletedAt, now),
      exceeded:
        Boolean(carrierHandoffRequestedAt) &&
        order.currentState === OrderState.AWAITING_CARRIER_HANDOFF &&
        !carrierHandoffCompletedAt &&
        hoursSince(carrierHandoffRequestedAt, null, now) >
          FULFILMENT_SLA_HOURS.carrierHandoff,
      startedAt: carrierHandoffRequestedAt?.toISOString() ?? null,
      completedAt: carrierHandoffCompletedAt?.toISOString() ?? null,
    },
  ];
}

function hoursSince(
  start: Date | null | undefined,
  end: Date | null | undefined,
  fallbackEnd: Date,
): number {
  if (!start) {
    return 0;
  }

  return ((end ?? fallbackEnd).getTime() - start.getTime()) / MS_PER_HOUR;
}