/** Thrown when a requested order does not exist. Expected, not a system fault. */
export class OrderNotFoundError extends Error {
  constructor(orderId: string) {
    super(`Order ${orderId} was not found.`);
    this.name = "OrderNotFoundError";
  }
}
