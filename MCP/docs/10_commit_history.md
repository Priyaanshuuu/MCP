# Commit History

A record of every commit in the repository, in order, with a short note on what
each one changed and why. 23 commits across five phases.

---

## Phase 1 — Scaffold and exploration

| # | Commit | Date | Message | What it did |
|---|---|---|---|---|
| 1 | `cba9f27` | 2026-07-29 | `Basic_Server_Setup` | Initial commit: `package.json`, `tsconfig.json`, `.gitignore` and a stub `src/index.ts`. |
| 2 | `28b35e4` | 2026-07-30 | `Weather_MCP` | A throwaway weather-tool MCP server, written to learn the SDK. Discarded in commit 7. |

---

## Phase 2 — Design documentation

Documentation was written before implementation, so the architecture was settled
on paper first.

| # | Commit | Date | Message | What it did |
|---|---|---|---|---|
| 3 | `17ea461` | 2026-07-30 | `Problem_statement_Doc` | Added `01-problem-statement.md`: the operational problem, users and goals. |
| 4 | `70faac3` | 2026-07-30 | `architecture_and_productDesign_file` | Added `02_productDecision.md` and `03_architecture.md`. |
| 5 | `294896f` | 2026-07-30 | `mcpDesign_and_dataModel` | Added `04_MCP_Design` and `05_dataModel.md`. |
| 6 | `a14c001` | 2026-07-30 | `detailed_md_files` | Added tradeoffs, development plan, verification and ADR docs; expanded the earlier five. Completed the nine-document set. |

---

## Phase 3 — Foundation

| # | Commit | Date | Message | What it did |
|---|---|---|---|---|
| 7 | `ff8c23b` | 2026-07-30 | `Setup` | Removed the weather prototype and its committed build output, clearing the way for the real project. |
| 8 | `3f74799` | 2026-07-30 | `initialize TypeScript project with Prisma and MCP SDK` | Real project init: Prisma config, first schema, MCP SDK dependency, strict TypeScript, separate `tsconfig.tooling.json` for tests and scripts. |
| 9 | `cb7b23f` | 2026-07-31 | `schema_design` | Finalised the six models — Order, Payment, Shipment, Inventory, OrderItem, TimelineEvent — with status enums. |
| 10 | `cd75029` | 2026-07-31 | `feat(seed): initialize Prisma seed script` | Added `prisma/seed.ts` and wired the seed command into Prisma config. |
| 11 | `53844e3` | 2026-07-31 | `seeding_Data` | Filled in the fixture data: five orders, one per root cause, plus inventory and timeline events. |

---

## Phase 4 — Business logic and MCP surface

Built bottom-up so each layer could be tested before the one above it existed.

| # | Commit | Date | Message | What it did |
|---|---|---|---|---|
| 12 | `6f9f9c0` | 2026-07-31 | `feat(repository): add order repository` | Added the Prisma client singleton and `OrderRepository`, isolating all data access behind one module. |
| 13 | `3c3eb9f` | 2026-07-31 | `feat(service): implement order investigation workflow` | Added `InvestigationService` with the root-cause precedence logic, and the `RootCause` type. The core diagnosis rules. |
| 14 | `f8da14f` | 2026-07-31 | `MCP_Setup` | Added the MCP server factory and the first tool, `investigate_order`. |
| 15 | `3cd98ce` | 2026-08-01 | `feat(mcp): expose investigate_order tool over stdio` | Completed the stdio transport so a local MCP client could call the tool end to end. |
| 16 | `265d5dd` | 2026-08-01 | `HTTP_Transport` | Added the remote transport: `node:http` bridged to the SDK's streamable HTTP transport, stateless, with origin checks and a body limit. No framework. |
| 17 | `61ff3b4` | 2026-08-01 | `MCP_and_TestFiles` | Added the remaining two tools (`list_blocked_orders`, `get_order_timeline`), `OrderService`, the shared error envelope, and all three test suites including the stdio end-to-end test. |
| 18 | `da75a3e` | 2026-08-01 | `Final_brushups` | Extracted `OrderNotFoundError`, tightened error handling across tools and services, and refined the HTTP layer. |

---

## Phase 5 — Deployment and release

| # | Commit | Date | Message | What it did |
|---|---|---|---|---|
| 19 | `17ecf1e` | 2026-08-02 | `Prod_fixes` | Changed `build` to `prisma generate && tsc`. The generated Prisma client is not committed, so `tsc` alone failed on a clean clone — the cause of the first deploy failure. |
| 20 | `45aae2d` | 2026-08-02 | `Prod_fixes` | Guarded `process.loadEnvFile()` in `prisma.config.ts` and `prisma/seed.ts`. It threw `ENOENT` on hosts that inject environment variables and have no `.env` — the second deploy failure. |
| 21 | `64525cb` | 2026-08-02 | `Final_Submit` | Final adjustments to the HTTP layer, order service, error envelope and seed data. |
| 22 | `095b44d` | 2026-08-02 | `Docs_updatation` | Corrected three documentation errors: a root cause named `Shipment Pending` that does not exist in the code, an incomplete error-code list, and a stale "Why Next.js?" section for a framework the project never used. Recorded the deployment outcome. |
| 23 | `9d35aa9` | 2026-08-02 | `README_FILE` | Added the README: live endpoint, verification steps, tool reference and the Render configuration. |

---

## Notes

Two commits share the message `Prod_fixes` (19 and 20) but fix unrelated
problems, each surfaced by a separate failed deploy: the first a missing build
step, the second an unguarded `.env` read.

Both deployment failures had the same underlying cause — generated and
environment-specific files are deliberately kept out of version control, so the
build must reproduce them rather than assume they are present.
