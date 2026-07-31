import { OrderRepository } from "./repositories/order.repository.js";

async function main() {
  const repository = new OrderRepository();

  const orders = await repository.getAll();

  console.log(orders);
}

main();