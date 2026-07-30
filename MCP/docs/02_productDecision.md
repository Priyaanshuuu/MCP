# 1. Purpose

This document explains the major product decisions made during the design of the Commerce Operations Copilot.

The assignment intentionally provides an open problem statement. Rather than implementing a broad collection of unrelated features, this project focuses on solving one operational problem exceptionally well.

Every decision documented here aims to maximize product value while keeping the implementation realistic within the assignment constraints.

---

# 2. Product Vision

The long-term vision is to build an AI-native Operations Copilot that enables commerce operations teams to investigate and resolve operational issues independently.

Instead of searching dashboards, databases, or internal tools, an operations executive should be able to ask natural language questions such as:

> Why hasn't order ORD-102 shipped?

The AI should investigate multiple systems, determine the most likely root cause, and recommend the next best action.

The user should never need to understand how the backend works.

---

# 3. Design Principles

The following principles influenced every product decision.

## 3.1 AI-First

The primary interface is a Large Language Model.

Users communicate with the AI.

The AI communicates with the MCP Server.

The MCP Server communicates with backend services.

---

## 3.2 Business Capabilities Over CRUD

The MCP server exposes business actions rather than database operations.

Instead of:

```
getOrder()
getPayment()
getShipment()
```

The system exposes:

```
investigate_order()

execute_resolution()

get_order_timeline()

find_orders_needing_attention()
```

This allows the AI to reason at the same abstraction level as an operations executive.

---

## 3.3 Explainability

Every investigation should answer four questions:

- What happened?
- Why did it happen?
- What evidence supports the conclusion?
- What should happen next?

The assistant should explain operational decisions instead of simply returning raw database records.

---

## 3.4 Single Complete Workflow

The project intentionally implements one complete workflow rather than multiple incomplete workflows.

This demonstrates:

- Product thinking
- Engineering quality
- MCP capabilities
- Business reasoning

without introducing unnecessary complexity.

---

# 4. Candidate Solutions Considered

Before selecting the final workflow, several operational domains were evaluated.

---

## Option A — Order Investigation ✅ Selected

Description

Investigate why an order cannot proceed through fulfillment.

Example Questions

- Why hasn't my order shipped?
- Why is this order blocked?
- What is preventing fulfillment?

Advantages

- Requires reasoning across multiple domains.
- Demonstrates MCP effectively.
- Common real-world commerce problem.
- Easy to demonstrate end-to-end.
- Allows meaningful business recommendations.

Disadvantages

- Requires relationships between several entities.

Decision

Selected.

Reason

Provides the strongest demonstration of AI-assisted operational investigations while remaining achievable within the assignment scope.

---

## Option B — Refund Assistant

Description

Assist operations teams in processing customer refunds.

Advantages

- Simple implementation.
- Easy business rules.

Disadvantages

- Mostly transactional.
- Limited reasoning.
- CRUD-heavy.
- Weak MCP demonstration.

Decision

Rejected.

---

## Option C — Inventory Monitoring

Description

Monitor inventory shortages and replenishment.

Advantages

- Operationally useful.
- Strong warehouse use case.

Disadvantages

- Less customer-facing.
- Requires warehouse simulation.
- More complex data model.

Decision

Rejected.

---

## Option D — Fraud Investigation

Description

Analyze suspicious payment activity.

Advantages

- Interesting AI use case.

Disadvantages

- Difficult to simulate realistically.
- Requires scoring algorithms.
- Large implementation effort.

Decision

Rejected.

---

# 5. Why Order Investigation?

Order Investigation naturally combines multiple business domains into one coherent workflow.

The investigation requires information from:

- Orders
- Payments
- Inventory
- Shipments

This allows the MCP server to orchestrate multiple services while presenting a single business capability to the AI.

Instead of exposing isolated backend systems, the product exposes operational knowledge.

---

# 6. Why MCP?

The assignment specifically requires a remotely hosted MCP server.

Rather than treating MCP as a transport protocol, this project treats it as the operational interface of the application.

The MCP server becomes the only way an AI client interacts with the business domain.

Without MCP

```
LLM

↓

REST APIs

↓

Database
```

With MCP

```
LLM

↓

Business Tools

↓

Business Services

↓

Repositories

↓

Prisma

↓

SQLite
```

This keeps AI interactions focused on operational capabilities instead of implementation details.

---

# 7. Why Next.js?

Although the project does not require a frontend, Next.js provides:

- Mature TypeScript tooling
- Simple deployment
- API capabilities (if required later)
- Familiar development workflow

The business logic remains framework-independent and can be moved to any Node.js runtime with minimal effort.

---

# 8. Why Prisma + SQLite?

Several storage options were considered.

## JSON Files

Advantages

- Extremely simple.

Disadvantages

- No relationships.
- No type safety.
- Manual querying.
- Poor scalability.

Decision

Rejected.

---

## PostgreSQL

Advantages

- Production-ready.
- Advanced querying.

Disadvantages

- Requires additional infrastructure.
- Unnecessary complexity for the assignment.

Decision

Rejected.

---

## Prisma + SQLite ✅

Advantages

- Type-safe ORM.
- Relational modeling.
- Zero external dependencies.
- Easy local development.
- Easy migration to PostgreSQL.
- Better demonstration of backend engineering.

Decision

Selected.

---

# 9. Why Repository Pattern?

Business logic should never know how data is stored.

Repositories isolate data access from business rules.

Benefits

- Easier testing.
- Better maintainability.
- Cleaner services.
- Easier migration to another database.

---

# 10. Why a Layered Architecture?

Each layer has exactly one responsibility.

```
LLM

↓

MCP

↓

Tools

↓

Services

↓

Repositories

↓

Prisma

↓

SQLite
```

Benefits

- Separation of concerns.
- Easier debugging.
- Better testing.
- Clear ownership.
- Future extensibility.

---

# 11. Product Success Metrics

The product succeeds if an operations executive can:

- Ask a natural language question.
- Receive an accurate diagnosis.
- Understand the reasoning.
- Execute a recommended action.
- Resolve the issue without engineering assistance.

---

# 12. Future Roadmap

Potential future capabilities include:

### Phase 2

- Refund investigations
- Return investigations
- Customer communication
- Incident generation

### Phase 3

- ERP integrations
- Payment gateway integrations
- Warehouse systems
- Carrier APIs

### Phase 4

- Multi-tenant commerce platform
- Analytics
- Workflow automation
- Human approval flows

The current implementation intentionally excludes these features to maintain focus.

---

# 13. Key Product Decisions

| Decision | Reason |
|----------|--------|
| Single workflow | Demonstrates depth over breadth |
| MCP-first design | Makes AI integration central |
| Business-oriented tools | Better abstraction than CRUD |
| Prisma + SQLite | Strong backend engineering with minimal infrastructure |
| Layered architecture | Maintainable and testable |
| Synthetic data | Safe and deterministic |

---

# 14. Conclusion

The Commerce Operations Copilot is intentionally designed around one complete operational workflow: investigating blocked orders.

By exposing business-oriented capabilities through a hosted MCP server, the system enables AI models to reason about operational problems without requiring direct access to backend systems.

This approach aligns with the assignment objective of building an AI-native solution where the MCP server is a core architectural component rather than an auxiliary integration.