import { Router, type IRouter } from "express";
import {
  CreateCustomerBody, CreateTicketBody, GetPublicTrackingParams, GetTicketParams,
  ListTicketsQueryParams, RecordPaymentBody, RecordPaymentParams, RetryNotificationParams,
  UpdateTicketBody, UpdateTicketParams, UpdateTicketStatusBody, UpdateTicketStatusParams,
} from "@workspace/api-zod";
import { customers, detail, findTicket, summarizeTicket, technicians, tickets, type RepairTicket } from "./repair-store";
import { requireAuth, resolveStore } from "../lib/auth";

const router: IRouter = Router();
const ticketResponse = (ticket: RepairTicket) => detail(ticket);
const activeStore = (req: { storeId?: string }) => req.storeId ?? "store-central";
const scopedTickets = (req: { storeId?: string }) =>
  tickets.filter((ticket) => ticket.storeId === activeStore(req));

router.get("/public/track/:ticketNumber", (req, res) => {
  const params = GetPublicTrackingParams.parse(req.params);
  const ticket = findTicket(params.ticketNumber);
  if (!ticket) return res.status(404).json({ error: "Ticket not found" });
  const firstName = ticket.customerName.split(" ")[0];
  return res.json({
    ticketNumber: ticket.ticketNumber, customerName: `${firstName} ${ticket.customerName.split(" ").slice(1).map((part) => `${part[0]}.`).join(" ")}`,
    deviceBrand: ticket.deviceBrand, deviceModel: ticket.deviceModel, complaint: ticket.complaint, status: ticket.status,
    history: ticket.history, estimatedCompletion: ticket.estimatedCompletion, delayReason: ticket.delayReason ?? null,
    pickupInfo: ticket.status === "READY_PICKUP" ? "Device is ready. Please bring your ticket number when collecting." : null,
  });
});

router.use(requireAuth, resolveStore);

router.get("/dashboard", (req, res) => {
  const scoped = scopedTickets(req);
  const statusCounts = scoped.reduce<Record<string, number>>((all, ticket) => {
    all[ticket.status] = (all[ticket.status] ?? 0) + 1;
    return all;
  }, {});
  const summaries = scoped.map(summarizeTicket);
  res.json({
    totalToday: scoped.length, newTickets: scoped.filter((t) => t.status === "DEVICE_RECEIVED").length, underRepair: scoped.filter((t) => t.status === "REPAIRING").length,
    waitingParts: scoped.filter((t) => t.status === "WAITING_PART").length,
    delayed: scoped.filter((t) => t.status === "DELAYED").length,
    completed: scoped.filter((t) => t.status === "COMPLETED").length,
    readyPickup: scoped.filter((t) => t.status === "READY_PICKUP").length,
    recentTickets: summaries, upcomingDeadlines: summaries.filter((t) => t.status !== "PICKED_UP"), statusCounts,
  });
});

router.get("/tickets", (req, res) => {
  const query = ListTicketsQueryParams.parse(req.query);
  const search = query.search?.toLowerCase();
  const rows = scopedTickets(req).filter((ticket) =>
    (!search || [ticket.ticketNumber, ticket.customerName, ticket.deviceBrand, ticket.deviceModel, ticket.whatsapp].some((value) => value.toLowerCase().includes(search))) &&
    (!query.status || ticket.status === query.status) &&
    (!query.priority || ticket.priority === query.priority) &&
    (!query.technicianId || ticket.technicianId === query.technicianId),
  );
  res.json(rows.map(summarizeTicket));
});

router.post("/tickets", (req, res) => {
  const body = CreateTicketBody.parse(req.body);
  const storeId = activeStore(req);
  const next = tickets.length + 1;
  const ticket: RepairTicket = {
    id: `tkt-${String(next).padStart(3, "0")}`, storeId,
    ticketNumber: `SRV-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${String(next).padStart(4, "0")}`,
    customerName: body.customerName, whatsapp: body.whatsapp, deviceBrand: body.deviceBrand, deviceModel: body.deviceModel,
    imei: body.imei ?? null, color: body.color ?? null, complaint: body.complaint, status: "DEVICE_RECEIVED", priority: body.priority,
    intakeDate: new Date().toISOString(), estimatedCompletion: body.estimatedCompletion ?? null,
    technicianName: technicians.find((tech) => tech.id === body.technicianId)?.name ?? null, technicianId: body.technicianId,
    totalCost: 0, paidAmount: 0, unreadNotifications: 0, condition: body.condition ?? null, accessories: body.accessories ?? [],
    diagnosis: null, cause: null, recommendation: null, laborCost: 0, partsCost: 0, payments: [],
    notifications: [{ id: `notif-${next}`, type: "TICKET_CREATED", recipient: body.whatsapp, status: "QUEUED", sentAt: null, message: `Hello ${body.customerName}, your device has been received for repair.` }],
    history: [{ id: `hist-${next}`, status: "DEVICE_RECEIVED", at: new Date().toISOString(), actor: "Ayu Rahma" }],
    outstandingBalance: 0,
  };
  tickets.unshift(ticket);
  res.status(201).json(summarizeTicket(ticket));
});

router.get("/tickets/:id", (req, res) => {
  const params = GetTicketParams.parse(req.params);
  const ticket = findTicket(params.id, activeStore(req));
  if (!ticket) return res.status(404).json({ error: "Ticket not found" });
  return res.json(ticketResponse(ticket));
});

router.patch("/tickets/:id", (req, res) => {
  const params = UpdateTicketParams.parse(req.params);
  const body = UpdateTicketBody.parse(req.body);
  const ticket = findTicket(params.id, activeStore(req));
  if (!ticket) return res.status(404).json({ error: "Ticket not found" });
  Object.assign(ticket, body);
  if (body.technicianId !== undefined) ticket.technicianName = technicians.find((tech) => tech.id === body.technicianId)?.name ?? null;
  if (body.laborCost !== undefined || body.partsCost !== undefined) {
    ticket.laborCost = body.laborCost ?? ticket.laborCost;
    ticket.partsCost = body.partsCost ?? ticket.partsCost;
    ticket.totalCost = ticket.laborCost + ticket.partsCost;
  }
  return res.json(ticketResponse(ticket));
});

router.post("/tickets/:id/status", (req, res) => {
  const params = UpdateTicketStatusParams.parse(req.params);
  const body = UpdateTicketStatusBody.parse(req.body);
  const ticket = findTicket(params.id, activeStore(req));
  if (!ticket) return res.status(404).json({ error: "Ticket not found" });
  ticket.status = body.status;
  ticket.delayReason = body.delayReason ?? ticket.delayReason;
  ticket.history.push({ id: `hist-${Date.now()}`, status: body.status, at: new Date().toISOString(), actor: "Ayu Rahma", note: body.note ?? body.delayReason });
  if (body.status === "READY_PICKUP") {
    ticket.notifications.unshift({ id: `notif-${Date.now()}`, type: "READY_PICKUP", recipient: ticket.whatsapp, status: "QUEUED", sentAt: null, message: "Your device is ready for pickup." });
  }
  return res.json(ticketResponse(ticket));
});

router.post("/tickets/:id/payments", (req, res) => {
  const params = RecordPaymentParams.parse(req.params);
  const body = RecordPaymentBody.parse(req.body);
  const ticket = findTicket(params.id, activeStore(req));
  if (!ticket) return res.status(404).json({ error: "Ticket not found" });
  const payment = { id: `pay-${Date.now()}`, amount: body.amount, method: body.method, paidAt: new Date().toISOString(), receivedBy: "Ayu Rahma" };
  ticket.payments.push(payment);
  ticket.paidAmount += body.amount;
  ticket.outstandingBalance = Math.max(0, ticket.totalCost - ticket.paidAmount);
  return res.status(201).json(payment);
});

router.post("/tickets/:id/notifications/:notificationId/retry", (req, res) => {
  const params = RetryNotificationParams.parse(req.params);
  const ticket = findTicket(params.id, activeStore(req));
  const notification = ticket?.notifications.find((item) => item.id === params.notificationId);
  if (!notification) return res.status(404).json({ error: "Notification not found" });
  notification.status = "DELIVERED"; notification.sentAt = new Date().toISOString(); notification.error = null;
  return res.json(notification);
});

router.get("/customers", (req, res) => {
  const storeId = activeStore(req);
  res.json(customers.filter((customer) => customer.storeId === storeId).map((customer) => ({
    ...customer,
    totalTickets: tickets.filter((ticket) => ticket.storeId === storeId && ticket.whatsapp === customer.whatsapp).length,
    activeTickets: tickets.filter((ticket) => ticket.storeId === storeId && ticket.whatsapp === customer.whatsapp && !["PICKED_UP", "CANCELLED"].includes(ticket.status)).length,
  })));
});

router.post("/customers", (req, res) => {
  const body = CreateCustomerBody.parse(req.body);
  const customer = { id: `cus-${Date.now()}`, storeId: activeStore(req), ...body };
  customers.unshift(customer);
  res.status(201).json({ ...customer, totalTickets: 0, activeTickets: 0 });
});

export default router;