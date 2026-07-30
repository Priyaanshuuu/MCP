# 1. Introduction

Commerce operations teams are responsible for ensuring that customer orders move successfully through the order lifecycle—from placement and payment to fulfillment and delivery.

When an order becomes blocked, delayed, or fails unexpectedly, operations teams often depend on backend engineers to investigate the issue. Although the required information exists within internal systems, it is spread across multiple domains such as orders, payments, inventory, and shipments. Understanding the relationship between these systems requires technical knowledge that many operations users do not possess.

This dependency increases investigation time, delays issue resolution, and consumes engineering bandwidth for repetitive operational tasks.

This project aims to reduce that dependency by building an AI-native Commerce Operations Copilot powered by a remotely hosted Model Context Protocol (MCP) server.

---

# 2. Problem Statement

Commerce operations teams frequently encounter questions such as:

- Why hasn't order **ORD-102** shipped?
- Why is an order still blocked?
- Is payment preventing fulfillment?
- Is inventory unavailable?
- What action should be taken to resolve this issue?

Answering these questions typically requires manually checking multiple systems, correlating their data, and applying business rules to identify the root cause.

Because this process relies on engineering support, operational investigations become slower and less scalable.

The goal of this project is to allow an AI assistant to perform these investigations independently through structured business capabilities exposed by an MCP server.

---

# 3. Target User

## Primary User

**Commerce Operations Executive**

Typical responsibilities include:

- Monitoring order health
- Investigating delayed orders
- Resolving operational incidents
- Coordinating with payment and fulfillment teams
- Escalating unresolved issues

The target user understands commerce workflows but is **not expected to understand databases, backend APIs, or implementation details.**

---

# 4. Proposed Solution

The solution consists of a remotely hosted MCP server that exposes business-oriented tools.

Instead of giving the AI direct access to databases or CRUD APIs, the MCP server provides operational capabilities such as:

- Investigate an order
- View an order timeline
- Execute predefined resolutions
- Find orders requiring attention

A Large Language Model (LLM) interprets the user's request, selects the appropriate MCP tool, and presents the investigation results in natural language.

This allows operations users to interact with the system conversationally while keeping business logic centralized within the backend.

---

# 5. Solution Overview

```text
Operations User

        │

        ▼

Claude / ChatGPT

        │
        │  (Tool Selection)
        ▼

Hosted MCP Server

        │

        ▼

Business Services

        │

        ▼

Repository Layer

        │

        ▼

Prisma ORM

        │

        ▼

SQLite Database
```

The MCP server acts as the only interface between the LLM and backend systems.

---

# 6. Project Goals

The project aims to achieve the following objectives:

- Reduce engineering dependency for operational investigations.
- Demonstrate meaningful use of the Model Context Protocol.
- Build business-oriented AI capabilities instead of exposing raw APIs.
- Produce explainable investigation reports.
- Keep the implementation modular and maintainable.
- Demonstrate clean backend engineering practices.

---

# 7. Scope

## Included

The project includes:

- A remotely hosted MCP server.
- TypeScript implementation.
- Prisma ORM with SQLite.
- Synthetic commerce data.
- Business service layer.
- Repository pattern.
- Order investigation workflow.
- Resolution recommendations.
- Runtime verification and testing.

---

## Excluded

The following are intentionally out of scope:

- Authentication
- User management
- Frontend application
- Payment gateway integration
- Real commerce systems
- Customer notifications
- Warehouse management
- Refund processing
- Fraud detection
- Production infrastructure

These exclusions keep the implementation focused on the assignment objective: demonstrating an MCP-centric backend.

---

# 8. Primary Workflow

The project focuses on one complete operational workflow.

### Investigate a Blocked Order

```text
User

↓

"Why hasn't ORD-102 shipped?"

↓

LLM understands the request

↓

LLM selects investigate_order

↓

MCP executes business logic

↓

Payment Repository

Inventory Repository

Shipment Repository

↓

Investigation Service

↓

Root Cause

↓

Recommendation

↓

LLM explains the result
```

This workflow demonstrates end-to-end reasoning without exposing implementation details to the user.

---

# 9. Assumptions

The implementation assumes:

- The AI client supports MCP tool calling.
- Commerce data is synthetic and deterministic.
- SQLite is sufficient for the assignment scope.
- Business rules are simplified representations of real commerce systems.
- The user provides a valid Order ID when requesting investigations.

---

# 10. Success Criteria

The project will be considered successful if:

- The MCP server is remotely accessible.
- An AI client can discover available tools.
- The AI selects the correct tool for an investigation.
- The investigation correctly identifies the operational blocker.
- Recommendations are actionable and explainable.
- The complete workflow can be demonstrated in an end-to-end demo.

---

# 11. Risks

| Risk | Mitigation |
|------|------------|
| Incorrect tool selection by the LLM | Clear tool descriptions and schemas |
| Unrealistic mock data | Representative synthetic commerce scenarios |
| Business logic tightly coupled with tools | Dedicated service layer |
| Scope expansion | Restrict implementation to a single workflow |
| Limited development time | Prioritize core investigation capabilities |

---

# 12. Engineering Principles

The following principles guide every technical decision.

### Business-First Design

The system exposes business capabilities rather than CRUD operations.

---

### Separation of Concerns

Each architectural layer has a single responsibility.

- MCP → Tool Interface
- Services → Business Logic
- Repositories → Data Access
- Prisma → Persistence

---

### Explainability

Every investigation should explain:

- What happened
- Why it happened
- Supporting evidence
- Recommended action

---

### Deterministic Behavior

Given the same inputs and database state, the system should always produce the same investigation result.

---

### Extensibility

The architecture should support additional commerce workflows without requiring significant structural changes.

---

# 13. Expected Outcome

The final deliverable is an AI-powered Commerce Operations Copilot capable of independently investigating common commerce issues through a hosted MCP server.

Instead of exposing backend implementation details, the system provides structured business capabilities that allow an LLM to understand operational context, identify root causes, and recommend appropriate actions.

This approach demonstrates how MCP can serve as the operational intelligence layer between AI models and commerce systems while maintaining a clean, modular, and production-inspired backend architecture.