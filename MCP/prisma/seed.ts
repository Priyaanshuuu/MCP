/// <reference types="node" />
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import {
  OrderStatus,
  PaymentStatus,
  PrismaClient,
  ShipmentStatus,
} from "../src/generated/prisma/client.js";

process.loadEnvFile();

const adapter = new PrismaBetterSqlite3({
  url: process.env["DATABASE_URL"]!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting database seed...");
  await prisma.timelineEvent.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.inventory.deleteMany();

  await prisma.inventory.createMany({
    data: [
      {
        sku: "LAPTOP-001",
        available: 10,
        reserved: 2,
        warehouse: "WH-A",
      },
      {
        sku: "MOUSE-001",
        available: 25,
        reserved: 5,
        warehouse: "WH-A",
      },
      {
       
        sku: "KEYBOARD-001",
        available: 0,
        reserved: 3,
        warehouse: "WH-B",
      },
    ],
  });

  console.log("✅ Inventory seeded successfully.");

  await prisma.order.createMany({
    data: [
      {
        id: "ORD-101",
        customerName: "Alice",
        status: OrderStatus.READY_FOR_FULFILLMENT,
      },
      {
        id: "ORD-102",
        customerName: "Bob",
        status: OrderStatus.BLOCKED,
      },
      {
        id: "ORD-103",
        customerName: "Charlie",
        status: OrderStatus.BLOCKED,
      },
      {
        id: "ORD-104",
        customerName: "David",
        status: OrderStatus.BLOCKED,
      },
      {
        id: "ORD-105",
        customerName: "Eva",
        status: OrderStatus.DELIVERED,
      },
    ],
  });

  console.log("✅ Orders seeded successfully.");

  await prisma.payment.createMany({
    data: [
      {
        orderId: "ORD-101",
        status: PaymentStatus.SUCCESS,
      },
      {
        orderId: "ORD-102",
        status: PaymentStatus.FAILED,
        failureReason: "Card declined by issuing bank",
      },
      {
        orderId: "ORD-103",
        status: PaymentStatus.SUCCESS,
      },
      {
        orderId: "ORD-104",
        status: PaymentStatus.PENDING,
      },
      {
        orderId: "ORD-105",
        status: PaymentStatus.SUCCESS,
      },
    ],
  });

  console.log("✅ Payments seeded successfully.");

  await prisma.shipment.createMany({
    data: [
      {
        orderId: "ORD-101",
        status: ShipmentStatus.NOT_CREATED,
      },
      {
        orderId: "ORD-102",
        status: ShipmentStatus.NOT_CREATED,
      },
      {
        orderId: "ORD-103",
        status: ShipmentStatus.NOT_CREATED,
      },
      {
        orderId: "ORD-104",
        status: ShipmentStatus.NOT_CREATED,
      },
      {
        orderId: "ORD-105",
        status: ShipmentStatus.DELIVERED,
        carrier: "BlueDart",
      },
    ],
  });

  console.log("✅ Shipments seeded successfully.");

  await prisma.orderItem.createMany({
    data: [
      { orderId: "ORD-101", sku: "LAPTOP-001", quantity: 1 },
      { orderId: "ORD-102", sku: "MOUSE-001", quantity: 2 },
      { orderId: "ORD-103", sku: "KEYBOARD-001", quantity: 2 },
      { orderId: "ORD-104", sku: "LAPTOP-001", quantity: 1 },
      { orderId: "ORD-105", sku: "MOUSE-001", quantity: 1 },
    ],
  });

  console.log("✅ Order items seeded successfully.");

  await prisma.timelineEvent.createMany({
    data: [
      {
        orderId: "ORD-101",
        event: "Order created",
        timestamp: new Date("2026-07-28T09:00:00Z"),
      },
      {
        orderId: "ORD-101",
        event: "Payment captured",
        timestamp: new Date("2026-07-28T09:05:00Z"),
      },
      {
        orderId: "ORD-101",
        event: "Awaiting fulfilment",
        timestamp: new Date("2026-07-28T09:10:00Z"),
      },

      {
        orderId: "ORD-102",
        event: "Order created",
        timestamp: new Date("2026-07-28T10:00:00Z"),
      },
      {
        orderId: "ORD-102",
        event: "Payment failed: card declined by issuing bank",
        timestamp: new Date("2026-07-28T10:02:00Z"),
      },

      {
        orderId: "ORD-103",
        event: "Order created",
        timestamp: new Date("2026-07-28T11:00:00Z"),
      },
      {
        orderId: "ORD-103",
        event: "Payment captured",
        timestamp: new Date("2026-07-28T11:04:00Z"),
      },
      {
        orderId: "ORD-103",
        event: "Blocked: insufficient stock for KEYBOARD-001",
        timestamp: new Date("2026-07-28T11:06:00Z"),
      },

      {
        orderId: "ORD-104",
        event: "Order created",
        timestamp: new Date("2026-07-28T12:00:00Z"),
      },
      {
        orderId: "ORD-104",
        event: "Payment pending authorization",
        timestamp: new Date("2026-07-28T12:01:00Z"),
      },

      {
        orderId: "ORD-105",
        event: "Order created",
        timestamp: new Date("2026-07-27T08:00:00Z"),
      },
      {
        orderId: "ORD-105",
        event: "Payment captured",
        timestamp: new Date("2026-07-27T08:03:00Z"),
      },
      {
        orderId: "ORD-105",
        event: "Shipment dispatched via BlueDart",
        timestamp: new Date("2026-07-27T14:30:00Z"),
      },
      {
        orderId: "ORD-105",
        event: "Delivered to customer",
        timestamp: new Date("2026-07-29T11:20:00Z"),
      },
    ],
  });

  console.log("✅ Timeline events seeded successfully.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("❌ Seed failed:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
