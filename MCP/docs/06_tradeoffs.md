# 1. Purpose

Every software project is a balance between complexity, maintainability, development time, and future scalability.

Given the assignment constraints (approximately 3–4 hours of focused work), the objective was not to build a production-ready commerce platform but to deliver one complete, well-designed workflow centered around the Model Context Protocol (MCP).

This document explains the major technical decisions, the alternatives considered, and the reasoning behind the final choices.

---

# 2. Technology Decisions

| Area | Selected | Alternatives |
|------|----------|--------------|
| Language | TypeScript | JavaScript |
| AI Interface | MCP Server | REST-only APIs |
| Database | SQLite | JSON, PostgreSQL |
| ORM | Prisma | Raw SQL, Drizzle |
| Architecture | Layered | Monolithic services |
| Testing | Unit + Integration | Manual testing only |

---

# 3. Why TypeScript?

### Selected

TypeScript

### Alternatives

- JavaScript

### Reason

TypeScript provides:

- Static type checking
- Better IDE support
- Safer refactoring
- Improved maintainability
- Excellent Prisma integration

Since the assignment explicitly requires TypeScript, it was the natural choice.

---

# 4. Why an MCP Server?

### Selected

Hosted MCP Server

### Alternative

Traditional REST APIs

### Reason

The assignment emphasizes that the MCP should be a central part of the product.

Rather than exposing backend endpoints directly, the MCP Server exposes business-oriented capabilities that AI models can discover and invoke.

This creates a cleaner separation between AI reasoning and backend implementation.

---

# 5. Why Prisma + SQLite?

### Selected

Prisma with SQLite

### Alternatives

- JSON files
- PostgreSQL

### Reason

SQLite offers a lightweight relational database that requires no external infrastructure.

Prisma adds:

- Type safety
- Schema management
- Relationship modeling
- Automatic client generation

This combination provides production-inspired architecture while keeping the setup simple.

---

# 6. Why Not JSON Files?

JSON files would reduce initial setup but introduce several drawbacks:

- Manual data relationships
- No schema enforcement
- No type safety
- Poor scalability
- More complex querying

Although suitable for prototypes, they do not accurately represent how commerce systems manage relational data.

---

# 7. Why Not PostgreSQL?

PostgreSQL is a production-grade database and would be an appropriate choice for a real commerce platform.

However, it introduces additional infrastructure that does not provide significant value for this assignment.

SQLite delivers all required functionality while keeping the project self-contained and easy to run.

---

# 8. Why a Layered Architecture?

The application separates responsibilities into distinct layers.

```
LLM

↓

MCP Server

↓

MCP Tools

↓

Business Services

↓

Repositories

↓

Prisma

↓

SQLite
```

Benefits include:

- Easier testing
- Better maintainability
- Clear separation of concerns
- Reusable business logic

---

# 9. Why Business-Oriented Tools?

Instead of exposing low-level operations such as:

```
getOrder()

updatePayment()

getShipment()
```

The MCP exposes:

```
investigate_order()

execute_resolution()

get_order_timeline()

find_orders_needing_attention()
```

These align more closely with the workflows of an operations team and reduce the amount of reasoning required by the LLM.

---

# 10. Scope Decisions

The project intentionally focuses on one complete workflow.

Included:

- Order investigation
- Timeline retrieval
- Safe operational actions
- Operational recommendations

Excluded:

- Authentication
- Frontend
- Notifications
- Payment gateways
- Warehouse integrations
- Multi-tenant support
- Analytics dashboards

Prioritizing one polished workflow was considered more valuable than implementing multiple incomplete features.

---

# 11. Safety Tradeoffs

The solution intentionally restricts the capabilities of the MCP Server.

Current limitations include:

- Synthetic data only
- Whitelisted actions
- No arbitrary SQL execution
- No direct database access by the LLM
- No destructive operations outside predefined workflows

These constraints improve predictability and reduce operational risk.

---

# 12. Testing Strategy Tradeoffs

The focus is placed on verifying business behavior rather than achieving maximum code coverage.

Testing priorities include:

- Correct root cause identification
- Accurate recommendation generation
- Proper tool validation
- Reliable repository queries

This aligns testing effort with the most valuable functionality.

---

# 13. Future Scalability

Although intentionally lightweight, the architecture supports future enhancements.

Potential upgrades include:

- PostgreSQL
- Redis
- Background workers
- External commerce integrations
- Event-driven processing
- Multi-tenant support

These enhancements can be introduced without major architectural changes because of the existing separation between business logic and persistence.

---

# 14. Summary

The technical decisions made for this project prioritize clarity, maintainability, and correctness over feature count.

The selected architecture demonstrates how an MCP Server can serve as the central operational interface of an AI-native backend while remaining simple enough to implement within the assignment's time constraints.

Each tradeoff reflects a deliberate decision to maximize product value while minimizing unnecessary complexity.