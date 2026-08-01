import assert from "node:assert/strict";
import { after, describe, it } from "node:test";
import prisma from "../src/lib/prisma.js";
import type { OrderWithRelations } from "../src/repositories/order.repository.js";
import { OrderRepository } from "../src/repositories/order.repository.js";
import { InvestigationService } from "../src/services/investigation.service.js";

const service = new InvestigationService();

after(async () => {
  await prisma.$disconnect();
});

// Runs against the real seeded SQLite database. The seed is deterministic, and
// each seeded order maps to exactly one root cause.
describe("InvestigationService (seeded data)", () => {
  it("diagnoses a failed payment", async () => {
    const result = await service.investigateOrder("ORD-102");

    assert.equal(result.status, "BLOCKED");
    assert.equal(result.rootCause, "Payment Failed");
    assert.equal(result.explanation, "Card declined by issuing bank");
  });

  it("diagnoses a pending payment", async () => {
    const result = await service.investigateOrder("ORD-104");

    assert.equal(result.rootCause, "Payment Pending");
  });

  it("diagnoses unavailable inventory", async () => {
    const result = await service.investigateOrder("ORD-103");

    assert.equal(result.rootCause, "Inventory Unavailable");
    // The explanation must quote real numbers, not a generic message.
    assert.match(result.explanation, /KEYBOARD-001 has 0 in stock/);
  });

  it("diagnoses a missing shipment once payment succeeded", async () => {
    const result = await service.investigateOrder("ORD-101");

    assert.equal(result.rootCause, "Shipment Not Created");
  });

  it("reports no issues for a delivered order", async () => {
    const result = await service.investigateOrder("ORD-105");

    assert.equal(result.rootCause, "No Issues Found");
  });

  it("rejects an unknown order", async () => {
    await assert.rejects(
      () => service.investigateOrder("ORD-999"),
      /ORD-999 was not found/,
    );
  });
});

// The seed gives each order a single fault, so it cannot show which rule wins
// when several apply at once. These cases pin the precedence order.
describe("InvestigationService (root cause precedence)", () => {
  function serviceReturning(order: unknown): InvestigationService {
    const repository = {
      getById: async () => order as OrderWithRelations,
    } as unknown as OrderRepository;

    return new InvestigationService(repository);
  }

  it("prefers a failed payment over an inventory shortage", async () => {
    const result = await serviceReturning({
      id: "ORD-X",
      status: "BLOCKED",
      payment: { status: "FAILED", failureReason: "Declined" },
      shipment: { status: "NOT_CREATED" },
      items: [{ sku: "SKU-1", quantity: 5, inventory: { available: 0 } }],
    }).investigateOrder("ORD-X");

    assert.equal(result.rootCause, "Payment Failed");
  });

  it("prefers an inventory shortage over a missing shipment", async () => {
    const result = await serviceReturning({
      id: "ORD-X",
      status: "BLOCKED",
      payment: { status: "SUCCESS", failureReason: null },
      shipment: { status: "NOT_CREATED" },
      items: [{ sku: "SKU-1", quantity: 5, inventory: { available: 1 } }],
    }).investigateOrder("ORD-X");

    assert.equal(result.rootCause, "Inventory Unavailable");
  });

  it("falls back to a generic explanation when no failure reason is recorded", async () => {
    const result = await serviceReturning({
      id: "ORD-X",
      status: "BLOCKED",
      payment: { status: "FAILED", failureReason: null },
      shipment: { status: "NOT_CREATED" },
      items: [],
    }).investigateOrder("ORD-X");

    assert.equal(result.explanation, "Payment could not be processed.");
  });
});
