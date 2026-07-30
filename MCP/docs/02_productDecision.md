# 1. Purpose

This document explains the major product decisions made during the planning phase of the project.

The assignment intentionally leaves the problem space open-ended. Instead of implementing many unrelated features, the project focuses on solving one operational problem extremely well.

Every decision documented here was made with the following constraints in mind:

- Limited implementation time (3–4 hours)
- AI-native workflow
- MCP as the primary integration layer
- Demonstrating product judgment over feature count

---

# 2. Product Vision

The long-term vision is to build an AI Operations Copilot capable of helping commerce operations teams investigate and resolve operational issues independently.

Rather than exposing internal systems directly to users, the copilot acts as an intelligent investigation assistant that understands business workflows and recommends appropriate actions.

The assistant should answer questions such as:

- Why is this order blocked?
- Why wasn't the order shipped?
- What is preventing fulfillment?
- What should I do next?

The goal is to reduce engineering involvement in repetitive operational investigations.

---

# 3. Product Philosophy

This project follows four guiding principles.

## Business Capabilities

The system exposes business capabilities instead of raw backend operations.

Example:

Good

```
Investigate Order
Retry Payment
Find Blocked Orders
```

Poor

```
Get Order
Get Payment
Update Shipment
```

Business-oriented tools allow the LLM to reason at the same abstraction level as an operations employee.

---

## Explainability

Every investigation should explain:

- What happened
- Why it happened
- Supporting evidence
- Confidence level
- Recommended next action

The assistant should never return unexplained database values.

---

## One Complete Workflow

Instead of implementing multiple incomplete features, the project focuses on one complete investigation workflow.

A complete end-to-end experience demonstrates stronger product thinking than several disconnected features.

---

## AI-First Design

The user interacts with the LLM.

The LLM interacts with the MCP server.

The MCP server performs business operations.

The user never directly interacts with backend systems.

---

# 4. Candidate Problem Areas Considered

Several operational workflows were evaluated before selecting the final scope.

## Option A — Order Investigation ✅ Selected

Description

Investigate why an order cannot progress through the fulfillment pipeline.

Typical questions

- Why is my order blocked?
- Why wasn't it shipped?
- What is preventing fulfillment?

Advantages

- Demonstrates multiple business systems.
- Naturally requires reasoning.
- Excellent fit for MCP.
- Easy to explain during demo.
- Realistic operational scenario.

Disadvantages

- Requires modeling several related datasets.

Decision

Selected.

---

## Option B — Refund Management

Description

Assist operations with refund processing.

Advantages

- Easy workflow.
- Simple business logic.

Disadvantages

- Limited investigation.
- Mostly CRUD operations.
- Less opportunity for AI reasoning.

Decision

Rejected.

Reason

The workflow was too transactional and did not showcase MCP capabilities effectively.

---

## Option C — Inventory Management

Description

Investigate inventory shortages.

Advantages

- Real commerce use case.
- Interesting business logic.

Disadvantages

- Requires warehouse modeling.
- Less connected to customer-facing issues.

Decision

Rejected.

Reason

Would require additional logistics complexity beyond assignment scope.

---

## Option D — Fraud Detection

Description

Analyze suspicious transactions.

Advantages

- Interesting AI use case.

Disadvantages

- Difficult to model realistically.
- Requires risk scoring.
- High implementation complexity.

Decision

Rejected.

Reason

Not achievable within the project constraints.

---

# 5. Why Order Investigation Was Selected

Order investigation naturally combines several business domains into one workflow.

It requires information from:

- Orders
- Payments
- Inventory
- Shipment

This allows the MCP server to demonstrate meaningful orchestration and reasoning instead of simple data retrieval.

The workflow also mirrors real operational requests handled by commerce support teams.

---

# 6. Why MCP Is Central

The project intentionally avoids treating MCP as an additional API layer.

Instead, the MCP server represents the operational knowledge of the business.

The MCP tools expose complete business capabilities that an AI assistant can use during investigations.

Without the MCP server, the LLM would only have access to isolated datasets.

With MCP, the LLM gains structured operational capabilities.

Example

```
User

↓

LLM

↓

Investigate Order

↓

Business Logic

↓

Structured Investigation Report
```

---

# 7. Why Business Tools Instead of CRUD APIs

Early during planning, a CRUD-based design was considered.

Example

```
getOrder()

getPayment()

getInventory()
```

Although technically correct, this approach places most reasoning responsibility on the LLM.

Instead, the selected design exposes higher-level business tools.

Example

```
investigate_order()

execute_resolution()

get_order_timeline()
```

Benefits

- Simpler tool selection.
- Better reasoning.
- Lower token usage.
- Cleaner abstraction.
- Easier future expansion.

---

# 8. Why Synthetic Data

The assignment explicitly discourages using production data.

Synthetic datasets provide several advantages.

- Safe to publish.
- Predictable test cases.
- Easy verification.
- No privacy concerns.
- Reproducible demonstrations.

The mock data will intentionally include realistic operational failures such as:

- Payment decline
- Inventory unavailable
- Shipment delay
- Warehouse timeout

---

# 9. Product Scope

The project intentionally limits itself to one operational investigation workflow.

Included

- Investigate blocked order
- Explain root cause
- Recommend action
- Execute selected resolution
- Demonstrate MCP integration

Excluded

- Customer portal
- Refund workflows
- Warehouse dashboards
- Reporting
- Authentication
- Real payment providers

---

# 10. Product Success Metrics

The product is considered successful if an operations employee can:

- Ask a natural language question.
- Receive an accurate diagnosis.
- Understand the reasoning.
- Execute an appropriate resolution.
- Complete the workflow without engineering assistance.

---

# 11. Future Roadmap

The current implementation represents the first milestone.

Possible future extensions include:

Phase 2

- Refund investigation
- Return management
- Warehouse assignment
- Carrier tracking

Phase 3

- Fraud investigation
- Customer communication
- Analytics
- Automated incident creation

Phase 4

- Multi-tenant commerce support
- ERP integrations
- Real payment providers
- Production deployment

---

# 12. Product Principles

Every future feature should satisfy the following principles.

- Solves a real operational problem.
- Reduces engineering dependency.
- Exposes business capabilities.
- Works naturally with LLM tool calling.
- Produces explainable outputs.
- Can be independently verified.

---

# 13. Final Decision Summary

After evaluating multiple commerce workflows, Order Investigation was selected because it provides the strongest balance between product value, implementation effort, and demonstration quality.

The workflow naturally requires business reasoning across multiple domains, making the MCP server a core component of the solution rather than a thin wrapper around backend APIs.

This decision aligns with the primary objective of the assignment: demonstrating thoughtful product design and meaningful MCP integration within a constrained implementation scope.