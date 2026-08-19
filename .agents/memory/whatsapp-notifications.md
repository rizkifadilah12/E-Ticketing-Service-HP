---
name: WhatsApp notifications
description: Durable product decision for customer notification delivery in the repair workflow.
---

Notifications are represented as auditable records attached to a ticket, with a delivery status, recipient, message, error, and retry action. Ticket status changes should remain independent from provider delivery success.

**Why:** The repair lifecycle must not be lost when a third-party WhatsApp provider times out or is unavailable, and failed messages need a visible retry path.

**How to apply:** When adding a WhatsApp connector, replace the queue delivery implementation behind the existing notification endpoint rather than coupling provider calls into status transitions.