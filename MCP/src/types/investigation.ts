import type { OrderState } from "../generated/prisma/client.js";

export type InvestigationCause =
  | "PICKING_DELAY"
  | "PACKING_DELAY"
  | "CARRIER_HANDOFF_DELAY"
  | "NO_DELAY";

export interface InvestigationEvidenceItem {
  checkpoint: "picking" | "packing" | "carrier_handoff";
  thresholdHours: number;
  elapsedHours: number;
  exceeded: boolean;
  startedAt: string | null;
  completedAt: string | null;
}

export interface InvestigationResult {
  orderId: string;
  currentState: OrderState;
  evidence: InvestigationEvidenceItem[];
  cause: InvestigationCause;
  proposedNextAction: string;
  requiresManagerReview: boolean;
  escalationReason: string | null;
}