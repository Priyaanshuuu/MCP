# Demo Video Script

A scene-by-scene script for recording the demonstration. Target length **5–6
minutes**. Narration is written to be read aloud; commands are copy-paste ready.

The order is deliberate: establish the problem, show the design, then prove it
works — ending on the AI conversation, which is the payoff.

---

## Before you hit record

| Check | Why |
|---|---|
| Open `https://mcp-3-8eyx.onrender.com/health` once | The free-tier instance sleeps. A cold start is 30–50 seconds of dead air on camera. |
| Add the connector in Claude beforehand and verify one question works | Do not debug a connection live. |
| Terminal font size up, clear scrollback | Small text is unreadable after video compression. |
| Run `npm test` once so it is warm | Avoids a slow first compile mid-recording. |
| Close unrelated tabs and notifications | |
| Have `ORD-103` and `ORD-102` in mind | These are the two most convincing cases. |

**Do not** open `/mcp` in a browser on camera — it returns a `text/event-stream`
error and looks broken. Explain it verbally instead if you want to cover it.

---

## Scene 1 — The problem (0:00–0:40)

*Visual: title slide, or `docs/01-problem-statement.md` on screen.*

> "When an e-commerce order gets stuck, finding out why is slow. The information
> is spread across payments, inventory and shipping. An operations person has to
> check each system in turn, and they need to know which one to check first.
>
> This project is a Model Context Protocol server that lets an AI assistant do
> that investigation. You ask, in plain English, why an order is blocked — and it
> answers with a specific root cause, the evidence behind it, and what to do next.
>
> It's deployed and live, and I'll be calling the hosted instance throughout."

---

## Scene 2 — The design (0:40–1:40)

*Visual: `README.md` architecture diagram, or `docs/03_architecture.md`.*

> "The architecture is layered. An AI client speaks MCP to the server. Tools
> validate input and shape responses. Services hold the business logic.
> Repositories own data access. Prisma talks to SQLite.
>
> Each layer only depends on the one below it. The diagnosis logic doesn't know
> MCP exists, so I can unit test it directly and move it to another transport
> without touching it."

*Visual: open `src/services/investigation.service.ts`.*

> "This is the part that matters. The server exposes three business-level tools
> rather than raw database access — that's the key design decision. If I gave the
> model a SQL tool, it would have to know my schema and decide what to check.
> Instead it asks one question and gets one diagnosed answer.
>
> The diagnosis follows a fixed precedence: payment failed, payment pending,
> inventory short, shipment not created, then no issues found. The most upstream
> blocker wins — a failed payment is reported even when inventory is also short,
> because restocking wouldn't release the order. Fixed order also means the same
> input always produces the same answer, which matters when an AI is relaying it."

---

## Scene 3 — It's actually live (1:40–2:05)

*Visual: browser, `https://mcp-3-8eyx.onrender.com/health`*

```
{ "status": "ok" }
```

> "First, the deployment. This is a health endpoint on the hosted service — it's
> running on Render, built from this repository."

*Optional: show the Render dashboard with the green **Live** badge.*

---

## Scene 4 — The server speaks MCP (2:05–2:35)

*Visual: terminal.*

```bash
curl -s -X POST https://mcp-3-8eyx.onrender.com/mcp \
  -H "content-type: application/json" \
  -H "accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

> "Here I'm asking the live server what tools it offers. It returns three:
> `list_blocked_orders` to find what needs attention, `investigate_order` to
> diagnose one, and `get_order_timeline` for history.
>
> Notice the descriptions — they tell the model when to use each tool and which
> tool to use instead. That's what lets it pick correctly without being told."

---

## Scene 5 — The tools work (2:35–3:20)

```bash
curl -s -X POST https://mcp-3-8eyx.onrender.com/mcp \
  -H "content-type: application/json" \
  -H "accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"list_blocked_orders","arguments":{}}}'
```

> "Three orders are blocked — Bob's, Charlie's and David's. This tells me *what*
> is stuck, not *why*."

```bash
curl -s -X POST https://mcp-3-8eyx.onrender.com/mcp \
  -H "content-type: application/json" \
  -H "accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"investigate_order","arguments":{"orderId":"ORD-103"}}}'
```

> "Now the diagnosis for Charlie's order. Root cause: inventory unavailable.
> And critically, the evidence — *SKU KEYBOARD-001 has 0 in stock but the order
> requires 2* — plus a recommendation to restock before creating the shipment.
>
> That's a real number pulled from the database, not a generic message. An
> operations person can act on that immediately."

---

## Scene 6 — The payoff: an AI using it (3:20–4:50)

*Visual: Claude with the connector added. This is the most important scene — go
slowly and let the responses render fully.*

> "Now the same server, but through an AI assistant. I've added the hosted
> endpoint as a custom connector. I haven't told it anything about my database."

Ask, one at a time:

**1.** *"Which orders are blocked right now?"*

> "It picked `list_blocked_orders` on its own and is reporting three affected
> customers."

**2.** *"Why is ORD-103 stuck, and what should I do about it?"*

> "It called `investigate_order` and explained the inventory shortage in plain
> language, with the recommendation."

**3.** *"What about ORD-102?"*

> "Different order, different root cause — payment failed, card declined by the
> issuing bank. Same tool, and the precedence logic decided which of the possible
> blockers to report."

**4.** *"What happened to ORD-105?"* *(optional, if time allows)*

> "That's the timeline tool — created, payment captured, dispatched, delivered."

> "This is the whole point. No SQL, no dashboard, no knowledge of the schema —
> just a question and a useful answer."

---

## Scene 7 — Robustness (4:50–5:30)

*Pick one or both, depending on time.*

**Error handling** — ask Claude: *"Why is ORD-999 blocked?"*

> "There's no such order. The server returns a structured `ORDER_NOT_FOUND` error
> rather than throwing, so the model explains it as a missing order instead of
> surfacing a protocol failure."

**Tests** — terminal:

```bash
npm test
```

> "Twenty-two tests. Unit tests for the diagnosis rules including precedence
> conflicts, integration tests against the seeded database, and an end-to-end
> test that drives the real server over stdio the way a client does — handshake,
> tool listing, validation and error codes."

---

## Scene 8 — Close (5:30–6:00)

*Visual: `docs/` folder listing, then the README.*

> "The design decisions are all documented — problem statement, product
> decisions, architecture, MCP design, data model, tradeoffs and architecture
> decision records — with the reasoning and the alternatives I rejected.
>
> A note on scope: the tools are read-only by design. Letting an AI retry a
> payment is a much bigger safety question than letting it explain one, so
> diagnosis is the deliberate boundary.
>
> The server is live, the README has the endpoint and the steps to verify it
> yourself. Thanks for watching."

---

## Reference — data you can demo

Five seeded orders, one per root cause, so every branch is demonstrable:

| Order | Customer | Diagnosis | Good for showing |
|---|---|---|---|
| ORD-101 | Alice | Shipment Not Created | Paid but not shipped |
| ORD-102 | Bob | Payment Failed | The clearest failure |
| ORD-103 | Charlie | Inventory Unavailable | Best evidence line (0 vs 2) |
| ORD-104 | David | Payment Pending | Blocked but not failed |
| ORD-105 | Eva | No Issues Found | The healthy case, and a full timeline |
| ORD-999 | — | `ORDER_NOT_FOUND` | Error handling |

---

## If something goes wrong on camera

| Symptom | Cause | Say this |
|---|---|---|
| Long pause on first request | Free-tier cold start | "The instance was asleep — free tier spins down when idle." |
| Claude doesn't call a tool | Phrasing too vague | Re-ask naming the order: *"Investigate ORD-103."* |
| `404 Not found` | You hit `/` instead of `/health` | "There's no root route — only the health and MCP endpoints." |
| `Must accept text/event-stream` | Browser GET on `/mcp` | "That's the transport rejecting a browser; it needs an MCP client." |

Both of the last two are the server behaving correctly. If one appears, explain
it — it demonstrates you know the protocol.

---

## Trimming to 3 minutes

If you need it shorter, keep Scenes 3, 5 and 6 and compress the rest: state the
problem in two sentences, skip the `tools/list` call, and use only two questions
in the Claude scene (`ORD-103` and `ORD-102`). The live health check, one curl
diagnosis and the AI conversation are the minimum that proves the project works.
