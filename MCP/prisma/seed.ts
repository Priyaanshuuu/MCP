/// <reference types="node" />
import { PrismaPg } from "@prisma/adapter-pg";
import {
  OrderState,
  PrismaClient,
} from "../src/generated/prisma/client.js";
import { Pool } from "pg";

if (!process.env["DATABASE_URL"]) {
  try {
    process.loadEnvFile();
  } catch {
    // No .env file present; the check below reports the missing variable.
  }
}

const url = process.env["DATABASE_URL"];

if (!url) {
  throw new Error(
    "DATABASE_URL is not set. Add it to .env or provide it in the environment.",
  );
}

const connectionString = url;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const now = new Date();

const hoursAgo = (hours: number): Date =>
  new Date(now.getTime() - hours * 60 * 60 * 1000);

type SeedOrder = {
  orderNumber: string;
  customerName: string;
  currentState: OrderState;
  createdAt: Date;
  carrierName?: string;
  fulfilment: {
    pickingStartedAt?: Date | null;
    pickedAt?: Date | null;
    packingStartedAt?: Date | null;
    packedAt?: Date | null;
    carrierHandoffRequestedAt?: Date | null;
    carrierHandoffCompletedAt?: Date | null;
    dispatchedAt?: Date | null;
  };
  reservations: Array<{
    sku: string;
    quantity: number;
    reservedAt: Date;
  }>;
};

const orders: SeedOrder[] = [
  {
    orderNumber: "FO-1001",
    customerName: "Ava Thompson",
    currentState: OrderState.DELIVERED,
    createdAt: hoursAgo(72),
    carrierName: "MetroLine",
    fulfilment: {
      pickingStartedAt: hoursAgo(71.5),
      pickedAt: hoursAgo(70.5),
      packingStartedAt: hoursAgo(70),
      packedAt: hoursAgo(69),
      carrierHandoffRequestedAt: hoursAgo(68.5),
      carrierHandoffCompletedAt: hoursAgo(68),
      dispatchedAt: hoursAgo(68),
    },
    reservations: [
      { sku: "SKU-LAPTOP", quantity: 1, reservedAt: hoursAgo(72) },
    ],
  },
  {
    orderNumber: "FO-1002",
    customerName: "Ben Carter",
    currentState: OrderState.DELIVERED,
    createdAt: hoursAgo(66),
    carrierName: "ParcelWave",
    fulfilment: {
      pickingStartedAt: hoursAgo(65.75),
      pickedAt: hoursAgo(65),
      packingStartedAt: hoursAgo(64.5),
      packedAt: hoursAgo(63.75),
      carrierHandoffRequestedAt: hoursAgo(63.5),
      carrierHandoffCompletedAt: hoursAgo(62.75),
      dispatchedAt: hoursAgo(62.75),
    },
    reservations: [
      { sku: "SKU-HEADSET", quantity: 2, reservedAt: hoursAgo(66) },
    ],
  },
  {
    orderNumber: "FO-1003",
    customerName: "Chloe Patel",
    currentState: OrderState.DISPATCHED,
    createdAt: hoursAgo(18),
    carrierName: "SwiftShip",
    fulfilment: {
      pickingStartedAt: hoursAgo(17.5),
      pickedAt: hoursAgo(16.75),
      packingStartedAt: hoursAgo(16.5),
      packedAt: hoursAgo(15.5),
      carrierHandoffRequestedAt: hoursAgo(15.25),
      carrierHandoffCompletedAt: hoursAgo(14.75),
      dispatchedAt: hoursAgo(14.75),
    },
    reservations: [
      { sku: "SKU-DOCK", quantity: 1, reservedAt: hoursAgo(18) },
    ],
  },
  {
    orderNumber: "FO-1004",
    customerName: "Daniel Reed",
    currentState: OrderState.PICKING,
    createdAt: hoursAgo(14),
    fulfilment: {
      pickingStartedAt: hoursAgo(13),
      pickedAt: null,
    },
    reservations: [
      { sku: "SKU-LAPTOP", quantity: 1, reservedAt: hoursAgo(14) },
    ],
  },
  {
    orderNumber: "FO-1005",
    customerName: "Elena Brooks",
    currentState: OrderState.PICKING,
    createdAt: hoursAgo(10),
    fulfilment: {
      pickingStartedAt: hoursAgo(9),
      pickedAt: null,
    },
    reservations: [
      { sku: "SKU-MOUSE", quantity: 4, reservedAt: hoursAgo(10) },
    ],
  },
  {
    orderNumber: "FO-1006",
    customerName: "Farah Khan",
    currentState: OrderState.PICKING,
    createdAt: hoursAgo(20),
    fulfilment: {
      pickingStartedAt: hoursAgo(18),
      pickedAt: null,
    },
    reservations: [
      { sku: "SKU-KEYBOARD", quantity: 3, reservedAt: hoursAgo(20) },
    ],
  },
  {
    orderNumber: "FO-1007",
    customerName: "George Miller",
    currentState: OrderState.PACKING,
    createdAt: hoursAgo(15),
    carrierName: "MetroLine",
    fulfilment: {
      pickingStartedAt: hoursAgo(14.5),
      pickedAt: hoursAgo(13.75),
      packingStartedAt: hoursAgo(9),
      packedAt: null,
    },
    reservations: [
      { sku: "SKU-DOCK", quantity: 2, reservedAt: hoursAgo(15) },
    ],
  },
  {
    orderNumber: "FO-1008",
    customerName: "Hana Singh",
    currentState: OrderState.PACKING,
    createdAt: hoursAgo(12),
    carrierName: "ParcelWave",
    fulfilment: {
      pickingStartedAt: hoursAgo(11.75),
      pickedAt: hoursAgo(11),
      packingStartedAt: hoursAgo(7),
      packedAt: null,
    },
    reservations: [
      { sku: "SKU-HEADSET", quantity: 1, reservedAt: hoursAgo(12) },
    ],
  },
  {
    orderNumber: "FO-1009",
    customerName: "Ivan Lopez",
    currentState: OrderState.PACKING,
    createdAt: hoursAgo(19),
    carrierName: "SwiftShip",
    fulfilment: {
      pickingStartedAt: hoursAgo(18.5),
      pickedAt: hoursAgo(17.75),
      packingStartedAt: hoursAgo(13),
      packedAt: null,
    },
    reservations: [
      { sku: "SKU-LAPTOP", quantity: 1, reservedAt: hoursAgo(19) },
      { sku: "SKU-MOUSE", quantity: 1, reservedAt: hoursAgo(19) },
    ],
  },
  {
    orderNumber: "FO-1010",
    customerName: "Julia Ahmed",
    currentState: OrderState.AWAITING_CARRIER_HANDOFF,
    createdAt: hoursAgo(61),
    carrierName: "MetroLine",
    fulfilment: {
      pickingStartedAt: hoursAgo(60.5),
      pickedAt: hoursAgo(59.5),
      packingStartedAt: hoursAgo(59),
      packedAt: hoursAgo(58),
      carrierHandoffRequestedAt: hoursAgo(54),
      carrierHandoffCompletedAt: null,
    },
    reservations: [
      { sku: "SKU-DOCK", quantity: 1, reservedAt: hoursAgo(61) },
    ],
  },
  {
    orderNumber: "FO-1011",
    customerName: "Karim Nasser",
    currentState: OrderState.AWAITING_CARRIER_HANDOFF,
    createdAt: hoursAgo(75),
    carrierName: "ParcelWave",
    fulfilment: {
      pickingStartedAt: hoursAgo(74.5),
      pickedAt: hoursAgo(73.75),
      packingStartedAt: hoursAgo(73.5),
      packedAt: hoursAgo(72.25),
      carrierHandoffRequestedAt: hoursAgo(62),
      carrierHandoffCompletedAt: null,
    },
    reservations: [
      { sku: "SKU-HEADSET", quantity: 2, reservedAt: hoursAgo(75) },
    ],
  },
  {
    orderNumber: "FO-1012",
    customerName: "Layla Evans",
    currentState: OrderState.AWAITING_CARRIER_HANDOFF,
    createdAt: hoursAgo(52),
    carrierName: "SwiftShip",
    fulfilment: {
      pickingStartedAt: hoursAgo(51.5),
      pickedAt: hoursAgo(50.5),
      packingStartedAt: hoursAgo(50),
      packedAt: hoursAgo(49),
      carrierHandoffRequestedAt: hoursAgo(49),
      carrierHandoffCompletedAt: null,
    },
    reservations: [
      { sku: "SKU-LAPTOP", quantity: 1, reservedAt: hoursAgo(52) },
    ],
  },
  {
    orderNumber: "FO-1013",
    customerName: "Maya Wilson",
    currentState: OrderState.DELIVERED,
    createdAt: hoursAgo(24),
    carrierName: "MetroLine",
    fulfilment: {
      pickingStartedAt: hoursAgo(23.5),
      pickedAt: hoursAgo(22.75),
      packingStartedAt: hoursAgo(22.5),
      packedAt: hoursAgo(21.5),
      carrierHandoffRequestedAt: hoursAgo(21.25),
      carrierHandoffCompletedAt: hoursAgo(20.5),
      dispatchedAt: hoursAgo(20.5),
    },
    reservations: [
      { sku: "SKU-MOUSE", quantity: 3, reservedAt: hoursAgo(24) },
    ],
  },
  {
    orderNumber: "FO-1014",
    customerName: "Noah Price",
    currentState: OrderState.AWAITING_PICK,
    createdAt: hoursAgo(6),
    fulfilment: {
      pickingStartedAt: hoursAgo(5),
      pickedAt: null,
    },
    reservations: [
      { sku: "SKU-KEYBOARD", quantity: 1, reservedAt: hoursAgo(6) },
    ],
  },
  {
    orderNumber: "FO-1015",
    customerName: "Oona Gray",
    currentState: OrderState.PACKING,
    createdAt: hoursAgo(9),
    carrierName: "ParcelWave",
    fulfilment: {
      pickingStartedAt: hoursAgo(8.75),
      pickedAt: hoursAgo(8),
      packingStartedAt: hoursAgo(2),
      packedAt: null,
    },
    reservations: [
      { sku: "SKU-DOCK", quantity: 1, reservedAt: hoursAgo(9) },
    ],
  },
  {
    orderNumber: "FO-1016",
    customerName: "Priya Shah",
    currentState: OrderState.DISPATCHED,
    createdAt: hoursAgo(30),
    carrierName: "SwiftShip",
    fulfilment: {
      pickingStartedAt: hoursAgo(29.5),
      pickedAt: hoursAgo(28.5),
      packingStartedAt: hoursAgo(28),
      packedAt: hoursAgo(27),
      carrierHandoffRequestedAt: hoursAgo(26.5),
      carrierHandoffCompletedAt: hoursAgo(25.75),
      dispatchedAt: hoursAgo(25.75),
    },
    reservations: [
      { sku: "SKU-HEADSET", quantity: 1, reservedAt: hoursAgo(30) },
    ],
  },
  {
    orderNumber: "FO-1017",
    customerName: "Quinn Brooks",
    currentState: OrderState.PICKING,
    createdAt: hoursAgo(8),
    fulfilment: {
      pickingStartedAt: hoursAgo(8),
      pickedAt: null,
    },
    reservations: [
      { sku: "SKU-MOUSE", quantity: 2, reservedAt: hoursAgo(8) },
    ],
  },
  {
    orderNumber: "FO-1018",
    customerName: "Rosa Diaz",
    currentState: OrderState.PACKING,
    createdAt: hoursAgo(6),
    carrierName: "MetroLine",
    fulfilment: {
      pickingStartedAt: hoursAgo(5.5),
      pickedAt: hoursAgo(5),
      packingStartedAt: hoursAgo(4),
      packedAt: null,
    },
    reservations: [
      { sku: "SKU-LAPTOP", quantity: 1, reservedAt: hoursAgo(6) },
    ],
  },
];

async function main() {
  console.log("🌱 Seeding PostgreSQL fulfilment data...");

  await prisma.auditLog.deleteMany();
  await prisma.managerEscalation.deleteMany();
  await prisma.inventoryReservation.deleteMany();
  await prisma.fulfilment.deleteMany();
  await prisma.order.deleteMany();

  for (const seedOrder of orders) {
    await prisma.order.create({
      data: {
        orderNumber: seedOrder.orderNumber,
        customerName: seedOrder.customerName,
        currentState: seedOrder.currentState,
        createdAt: seedOrder.createdAt,
        fulfilment: {
          create: {
            carrierName: seedOrder.carrierName ?? null,
            pickingStartedAt: seedOrder.fulfilment.pickingStartedAt ?? null,
            pickedAt: seedOrder.fulfilment.pickedAt ?? null,
            packingStartedAt: seedOrder.fulfilment.packingStartedAt ?? null,
            packedAt: seedOrder.fulfilment.packedAt ?? null,
            carrierHandoffRequestedAt:
              seedOrder.fulfilment.carrierHandoffRequestedAt ?? null,
            carrierHandoffCompletedAt:
              seedOrder.fulfilment.carrierHandoffCompletedAt ?? null,
            dispatchedAt: seedOrder.fulfilment.dispatchedAt ?? null,
          },
        },
        inventoryReservations: {
          create: seedOrder.reservations.map((reservation) => ({
            sku: reservation.sku,
            quantity: reservation.quantity,
            reservedAt: reservation.reservedAt,
          })),
        },
      },
    });
  }

  console.log("✅ Seed completed successfully.");
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