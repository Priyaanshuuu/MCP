# Purpose

This document records the key architectural decisions made during the design of the Commerce Operations Copilot.

Each Architecture Decision Record (ADR) captures the context, the decision that was made, and the reasoning behind it. Recording these decisions provides future contributors with the rationale for the current architecture and helps avoid revisiting the same discussions without new information.

---

# ADR-001 — Use a Hosted MCP Server

## Status

Accepted

## Context

The assignment requires a remotely hosted Model Context Protocol (MCP) server and explicitly states that the MCP should be a central part of the solution rather than a thin integration.

## Decision

Implement a standalone hosted MCP server that exposes business-oriented tools.

## Consequences

### Positive

- Makes MCP the primary interface for AI clients.
- Aligns directly with the assignment requirements.
- Encourages clean separation between AI interactions and backend implementation.

### Negative

- Requires learning and implementing the MCP protocol.
- Adds an additional layer compared to a traditional REST-only backend.

---

# ADR-002 — Expose Business-Oriented Tools

## Status

Accepted

## Context

A traditional backend exposes CRUD operations. An AI assistant, however, is more effective when interacting with business capabilities.

## Decision

Expose tools such as:

- `investigate_order`
- `execute_resolution`
- `get_order_timeline`
- `find_orders_needing_attention`

instead of generic CRUD operations.

## Consequences

### Positive

- Better aligns with operational workflows.
- Reduces reasoning complexity for the LLM.
- Produces more meaningful tool descriptions.

### Negative

- Less flexible than exposing every backend operation.

---

# ADR-003 — Layered Architecture

## Status

Accepted

## Context

Business logic, MCP communication, and persistence should remain independent.

## Decision

Adopt the following architecture:

```text
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

## Consequences

### Positive

- Easier testing.
- Clear separation of concerns.
- Maintainable codebase.
- Framework independence.

### Negative

- Slightly more files compared to a monolithic implementation.

---

# ADR-004 — Prisma with SQLite

## Status

Accepted

## Context

The project requires relational data but should remain lightweight and easy to run.

## Decision

Use Prisma ORM with SQLite.

## Alternatives Considered

- JSON files
- PostgreSQL

## Consequences

### Positive

- Type safety.
- Relational modeling.
- Zero external infrastructure.
- Simple setup.

### Negative

- Not suitable for production-scale workloads.

---

# ADR-005 — Repository Pattern

## Status

Accepted

## Context

Business services should not depend directly on the database implementation.

## Decision

Introduce repositories between services and Prisma.

## Consequences

### Positive

- Isolates persistence logic.
- Improves testability.
- Simplifies future database migrations.

### Negative

- Adds additional abstraction.

---

# ADR-006 — Synthetic Data

## Status

Accepted

## Context

The assignment prohibits using real customer or production data.

## Decision

Use deterministic synthetic commerce data seeded into SQLite.

## Consequences

### Positive

- Safe to publish.
- Easy to reproduce.
- Consistent testing.
- Deterministic demonstrations.

### Negative

- Less representative of real production variability.

---

# ADR-007 — Single End-to-End Workflow

## Status

Accepted

## Context

The available implementation time is intentionally limited.

## Decision

Prioritize one complete operational workflow instead of implementing multiple partially completed workflows.

## Selected Workflow

Investigate why an order cannot proceed through fulfillment.

## Consequences

### Positive

- Demonstrates depth instead of breadth.
- Easier to verify.
- Stronger end-to-end story.

### Negative

- Fewer total features.

---

# ADR-008 — Framework-Agnostic Business Layer

## Status

Accepted

## Context

Business logic should not depend on transport protocols or framework-specific APIs.

## Decision

Keep business services independent of the MCP implementation.

## Consequences

### Positive

- Easier testing.
- Reusable logic.
- Future REST or GraphQL support without rewriting services.

### Negative

- Requires disciplined separation of responsibilities.

---

# Summary

The architecture of the Commerce Operations Copilot is the result of deliberate engineering decisions rather than incremental implementation.

Each accepted decision supports one or more of the project's primary goals:

- Keep MCP central to the product.
- Demonstrate clean backend architecture.
- Prioritize maintainability.
- Ensure deterministic behavior.
- Deliver one complete and verifiable operational workflow.

These ADRs provide a permanent record of the reasoning behind the architecture and serve as guidance for future enhancements.