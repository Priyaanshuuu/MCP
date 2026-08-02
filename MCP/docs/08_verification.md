# 1. Purpose

The objective of this document is to describe how the Commerce Operations Copilot will be verified.

Rather than maximizing code coverage, verification focuses on ensuring that the core business workflow behaves correctly under expected conditions.

The primary workflow is:

> Investigate why an order cannot proceed through fulfillment.

Every verification activity is designed around this workflow.

---

# 2. Verification Philosophy

The project follows three principles:

- Verify business behavior before implementation details.
- Prefer deterministic test scenarios.
- Validate complete workflows instead of isolated functions whenever practical.

This approach provides confidence that the MCP server delivers meaningful operational value.

---

# 3. Critical Workflow

The following workflow represents the primary success path.

```text
Operations User

↓

Ask:

"Why hasn't ORD-102 shipped?"

↓

LLM selects investigate_order

↓

MCP Tool executes

↓

Business Service investigates

↓

Repositories retrieve data

↓

Prisma queries SQLite

↓

Root cause identified

↓

Recommendation generated

↓

Structured response returned
```

If this workflow behaves correctly, the primary objective of the assignment has been achieved.

---

# 4. Verification Levels

The project verifies functionality across four levels.

| Level | Purpose |
|--------|---------|
| Repository | Validate database access |
| Service | Validate business rules |
| MCP Tool | Validate tool contracts |
| End-to-End | Validate complete workflow |

---

# 5. Repository Verification

Repositories are responsible only for retrieving data.

Example checks:

- Find order by ID.
- Retrieve payment information.
- Retrieve shipment details.
- Retrieve inventory information.
- Retrieve timeline events.

Expected outcome:

Repositories return the correct records without applying business logic.

---

# 6. Service Verification

Business services contain the operational intelligence of the application.

Verification scenarios include:

### Scenario 1

Payment failed.

Expected Result

Root Cause:

```
Payment Failed
```

Recommendation:

```
retry_payment
```

---

### Scenario 2

Inventory unavailable.

Expected Result

Root Cause:

```
Inventory Unavailable
```

Recommendation:

```
release_inventory
```

---

### Scenario 3

Shipment not created.

Expected Result

Root Cause:

```
Shipment Not Created
```

Recommendation:

```
recreate_shipment
```

---

### Scenario 4

Everything valid.

Expected Result

Order Status:

```
READY_FOR_FULFILLMENT
```

No blocking issue should be reported.

---

# 7. MCP Tool Verification

Each MCP tool should verify:

- Required parameters.
- Input validation.
- Structured output.
- Proper delegation to the service layer.

Example

Input

```json
{
  "orderId": "ORD-102"
}
```

Expected

- Tool executes successfully.
- Service is called.
- Structured investigation response is returned.

---

# 8. Validation Tests

The following invalid inputs should be handled gracefully.

| Input | Expected Result |
|--------|-----------------|
| Missing orderId | Validation error |
| Unknown orderId | ORDER_NOT_FOUND |
| Invalid action | INVALID_ACTION |
| Missing action | Validation error |

The server should never expose internal implementation details in error responses.

---

# 9. End-to-End Verification

The most important verification confirms the complete workflow.

### Steps

1. Start the hosted MCP Server.
2. Connect using an MCP-compatible client.
3. Discover available tools.
4. Invoke `investigate_order`.
5. Verify the returned investigation.
6. Confirm the LLM presents the result correctly.

Expected outcome:

The AI successfully completes the investigation without requiring direct database access.

---

# 10. Synthetic Test Data

Verification relies on deterministic seed data.

Example dataset:

| Order | Scenario |
|--------|----------|
| ORD-101 | Successful order |
| ORD-102 | Payment failed |
| ORD-103 | Inventory unavailable |
| ORD-104 | Shipment pending |
| ORD-105 | Fully fulfilled |

Because the data is deterministic, every verification run should produce identical results.

---

# 11. Manual Verification Checklist

Before submission, verify:

- MCP Server starts successfully.
- Database migration completes.
- Seed data loads correctly.
- MCP tools are discoverable.
- `investigate_order` returns the correct diagnosis.
- `list_blocked_orders` lists the expected orders.
- `get_order_timeline` returns chronological events.
- Hosted MCP endpoint is accessible.

---

# 12. Limitations

The verification strategy intentionally does not include:

- Performance testing
- Load testing
- Security penetration testing
- Multi-user concurrency testing
- Production monitoring

These areas are outside the scope of the assignment.

---

# 13. Success Criteria

The implementation is considered verified when:

- Repository queries return expected records.
- Business services produce deterministic results.
- MCP tools expose the expected contracts.
- End-to-end investigations identify the correct root cause.
- AI clients successfully use the hosted MCP server.

---

# 14. Summary

The verification strategy prioritizes correctness of the business workflow over exhaustive testing.

By validating repositories, services, MCP tools, and the complete end-to-end investigation process, the project demonstrates that the hosted MCP server delivers reliable operational capabilities aligned with the assignment objectives.