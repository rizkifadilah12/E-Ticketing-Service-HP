---
name: Multi-store isolation
description: Product decision for multi-branch repair operations.
---

The active store is selected in the operator shell and sent on API requests as `x-store-id`. Operational queries and mutations must scope tickets and customers to that store; public tracking should only resolve a ticket within the current store context unless a secure cross-store lookup is explicitly designed.

**Why:** A repair shop group needs branch-level operational separation while keeping one shared application and admin experience.

**How to apply:** Preserve the active store selector and request context when adding authentication, persistent database queries, user permissions, reports, receipts, or WhatsApp sender configuration.