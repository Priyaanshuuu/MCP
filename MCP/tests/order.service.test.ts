import assert from "node:assert/strict";
import { after, describe, it } from "node:test";
import prisma from "../src/lib/prisma.js";
import { OrderService } from "../src/services/order.service.js";

const service = new OrderService();

after(async () => {
  await prisma.$disconnect();
});

describe("OrderService.listBlockedOrders", () => {
  it("returns exactly the seeded blocked orders", async () => {
    const orders = await service.listBlockedOrders();

    assert.deepEqual(
      orders.map((order) => order.orderId),
      ["ORD-102", "ORD-103", "ORD-104"],
    );
  });

  it("excludes orders that are not blocked", async () => {
    const orders = await service.listBlockedOrders();

    assert.ok(orders.every((order) => order.status === "BLOCKED"));
  });

  it("includes the customer name for triage", async () => {
    const orders = await service.listBlockedOrders();

    assert.equal(orders[0]?.customerName, "Bob");
  });
});

describe("OrderService.getOrderTimeline", () => {
  it("returns events oldest first", async () => {
    const { orderId, timeline } = await service.getOrderTimeline("ORD-105");

    assert.equal(orderId, "ORD-105");

    const times = timeline.map((entry) => Date.parse(entry.time));
    assert.deepEqual(times, [...times].sort((a, b) => a - b));
  });

  it("serialises timestamps as ISO 8601 strings", async () => {
    const { timeline } = await service.getOrderTimeline("ORD-102");

    assert.equal(timeline[0]?.time, "2026-07-28T10:00:00.000Z");
    assert.equal(timeline[0]?.event, "Order created");
  });

  it("rejects an unknown order rather than returning an empty timeline", async () => {
    await assert.rejects(
      () => service.getOrderTimeline("ORD-999"),
      /ORD-999 was not found/,
    );
  });
});
