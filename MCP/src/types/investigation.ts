import type { OrderStatus } from "../generated/prisma/client.js";

export type RootCause =
  | "Payment Failed"
  | "Payment Pending"
  | "Inventory Unavailable"
  | "Shipment Not Created"
  | "No Issues Found";

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
