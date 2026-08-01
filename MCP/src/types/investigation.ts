import type { OrderStatus } from "../generated/prisma/client.js";
export const ROOT_CAUSES = [
  "Payment Failed",
  "Payment Pending",
  "Inventory Unavailable",
  "Shipment Not Created",
  "No Issues Found",
] as const;

export type RootCause = (typeof ROOT_CAUSES)[number];

export interface InvestigationResult {
  orderId: string;
  status: OrderStatus;
  rootCause: RootCause;
  explanation: string;
  recommendation: string;
}

export type Diagnosis = Pick<
  InvestigationResult,
  "rootCause" | "explanation" | "recommendation"
>;
