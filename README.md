# Commerce Operations Copilot

A remotely hosted [Model Context Protocol](https://modelcontextprotocol.io) server
that lets an AI assistant answer operational questions about a commerce backend:
which orders are stuck, why a specific order is blocked, and what happened to it.

Instead of exposing raw database access, the server exposes three business-level
tools. The AI asks *"why is this order blocked?"* and receives a single diagnosed
root cause with supporting evidence and a recommended next step.

---

## Live deployment

| | |
|---|---|
| **MCP endpoint** | `https://mcp-3-8eyx.onrender.com/mcp` |
| **Health probe** | https://mcp-3-8eyx.onrender.com/health |

The MCP endpoint speaks JSON-RPC and is not meant to be opened in a browser —
see [Verifying the live server](#verifying-the-live-server) below.

> The free-tier instance sleeps when idle. The first request after a pause can
> take 30–50 seconds while it wakes up. Hit the health URL once to warm it.

---

## Verifying the live server

### 1. Health check — browser or terminal

```bash
curl https://mcp-3-8eyx.onrender.com/health
```

```json
{ "status": "ok" }
```

This is the only endpoint intended for a browser.

### 2. List the available tools

```bash
curl -s -X POST https://mcp-3-8eyx.onrender.com/mcp \
  -H "content-type: application/json" \
  -H "accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

Returns `investigate_order`, `list_blocked_orders` and `get_order_timeline`
with their schemas.

### 3. Find the blocked orders

```bash
curl -s -X POST https://mcp-3-8eyx.onrender.com/mcp \
  -H "content-type: application/json" \
  -H "accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"list_blocked_orders","arguments":{}}}'
```

Returns `ORD-102` (Bob), `ORD-103` (Charlie) and `ORD-104` (David).

### 4. Diagnose one of them

```bash
curl -s -X POST https://mcp-3-8eyx.onrender.com/mcp \
  -H "content-type: application/json" \
  -H "accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"investigate_order","arguments":{"orderId":"ORD-103"}}}'
```

```json
{
  "orderId": "ORD-103",
  "status": "BLOCKED",
  "rootCause": "Inventory Unavailable",
  "explanation": "SKU KEYBOARD-001 has 0 in stock but the order requires 2.",
  "recommendation": "Restock the inventory before creating the shipment."
}
```

### 5. Connect a real MCP client

In Claude, go to **Settings → Connectors → Add custom connector** and paste:

```
https://mcp-3-8eyx.onrender.com/mcp
```

Then ask in plain English:

- *"Which orders are blocked right now?"*
- *"Why is ORD-103 stuck and what should I do about it?"*
- *"What happened to ORD-105?"*

### Expected non-errors

Two responses look like failures but are the server behaving correctly:

| Request | Response | Why |
|---|---|---|
| `GET /` in a browser | `404 {"error":"Not found"}` | Only `/health` and `/mcp` are routed. There is no root page. |
| `GET /mcp` in a browser | `-32000 Not Acceptable: Client must accept text/event-stream` | A browser sends `Accept: text/html`. The MCP transport requires `text/event-stream`. Real clients send the right header. |

---

## Tools

| Tool | Input | Answers |
|---|---|---|
| `list_blocked_orders` | none | Which orders need attention, and for which customers |
| `investigate_order` | `orderId` | Why one order is stuck, with evidence and a recommendation |
| `get_order_timeline` | `orderId` | What happened to an order and when, oldest first |

All three are read-only. Failures are returned as structured envelopes
(`ORDER_NOT_FOUND`, `INVESTIGATION_FAILED`, `BLOCKED_ORDERS_LOOKUP_FAILED`,
`TIMELINE_LOOKUP_FAILED`) rather than thrown, so the model can explain the
problem in plain language instead of surfacing an opaque protocol error.

### Diagnosis precedence

`investigate_order` reports exactly one root cause, checked in a fixed order so
the result is deterministic:

1. **Payment Failed** — payment status is `FAILED`
2. **Payment Pending** — payment status is `PENDING`
3. **Inventory Unavailable** — an item's available stock is below the quantity ordered
4. **Shipment Not Created** — payment succeeded but no shipment exists
5. **No Issues Found** — nothing is blocking the order

The most upstream blocker wins: a failed payment is reported even if inventory is
also short, because fixing inventory first would not release the order.

---

## Seeded data

The database ships with five orders, one per root cause, so every branch is
demonstrable:

| Order | Customer | Status | Diagnosis |
|---|---|---|---|
| ORD-101 | Alice | READY_FOR_FULFILLMENT | Shipment Not Created |
| ORD-102 | Bob | BLOCKED | Payment Failed — card declined |
| ORD-103 | Charlie | BLOCKED | Inventory Unavailable — KEYBOARD-001 |
| ORD-104 | David | BLOCKED | Payment Pending |
| ORD-105 | Eva | DELIVERED | No Issues Found |

Inventory: `LAPTOP-001` (10 available), `MOUSE-001` (25), `KEYBOARD-001` (0).

An unknown ID such as `ORD-999` returns a clean `ORDER_NOT_FOUND`.

---

## Architecture

```
AI client
   │  MCP (stdio or HTTP)
   ▼
tools/         input validation (Zod), error envelopes
   ▼
services/      diagnosis logic, root-cause precedence
   ▼
repositories/  data access
   ▼
Prisma  ──▶  SQLite
```

Each layer depends only on the one below it. The diagnosis logic in
`src/services/investigation.service.ts` knows nothing about MCP, so it is
testable directly and portable to another transport.

Built on plain Node.js — no HTTP framework. The remote transport is Node's
built-in `node:http` bridged to the SDK's
`WebStandardStreamableHTTPServerTransport`, running statelessly with a fresh
server per request. Five runtime dependencies in total.

Full rationale is in [`docs/`](./docs): problem statement, product decisions,
architecture, MCP design, data model, tradeoffs, development plan, verification
strategy and architecture decision records.

---

## Running locally

Requires Node.js 20+.

```bash
npm install
echo 'DATABASE_URL="file:./commerce.db"' > .env
npm run build             # runs prisma generate, then tsc
npx prisma db push
npx prisma db seed
```

Then either transport:

```bash
npm start                             # stdio (for a local MCP client)
MCP_TRANSPORT=http PORT=3000 npm start   # http://localhost:3000/mcp
```

Development with reload:

```bash
npm run dev
```

### Tests

```bash
npm test        # type-check, then unit + integration + MCP end-to-end tests
npm run typecheck
```

Tests run against the seeded database. `tests/mcp.e2e.test.ts` drives the real
server over stdio the way a client would, covering the handshake, tool listing,
diagnosis, input validation and error codes.

---

## Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `DATABASE_URL` | — | **Required.** SQLite location, e.g. `file:./commerce.db` |
| `MCP_TRANSPORT` | stdio | Set to `http` for remote hosting |
| `PORT` | `3000` | HTTP port. Injected by most hosts |
| `HOST` | `0.0.0.0` | HTTP bind address |
| `MCP_ALLOWED_ORIGINS` | unset | Comma-separated origin allowlist |

`MCP_ALLOWED_ORIGINS` is a DNS-rebinding guard that only applies to requests
carrying an `Origin` header — that is, browsers. Non-browser MCP clients are
unaffected, so it can be left unset unless a browser app calls the endpoint.

The three entry points (`src/lib/prisma.ts`, `prisma.config.ts`,
`prisma/seed.ts`) read `.env` only when `DATABASE_URL` is not already set, so
hosts that inject environment variables directly work without a `.env` file.

---

## Deploying

Configuration used for the live Render service:

| Setting | Value |
|---|---|
| Environment | Node |
| Root Directory | `MCP` |
| Build Command | `npm ci && npm run build && npx prisma db push && npx prisma db seed` |
| Start Command | `npm start` |
| Health Check Path | `/health` |

Environment variables: `MCP_TRANSPORT=http` and `DATABASE_URL=file:./commerce.db`.
Leave `PORT` unset — Render injects it.

Three details matter:

- **Root Directory must be `MCP`.** The application is in a subdirectory of the
  repository, so every command has to run from there.
- **`prisma generate` must precede `tsc`.** The generated Prisma client is not
  committed, and `src/lib/prisma.ts` imports from it, so compilation fails
  without it. This is why `npm run build` is `prisma generate && tsc`.
- **`MCP_TRANSPORT=http` is required.** Without it the server starts on stdio,
  holds no port, and the deploy fails with "no open ports detected".

SQLite on ephemeral storage means the database is reseeded on every deploy and
writes are lost on restart, which is fine for a read-only demonstration. For
persistence, attach a disk and point `DATABASE_URL` at a path on it — no code
change needed.
