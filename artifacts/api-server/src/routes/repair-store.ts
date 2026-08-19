export type RepairTicket = {
  id: string;
  storeId: string;
  ticketNumber: string;
  customerName: string;
  whatsapp: string;
  deviceBrand: string;
  deviceModel: string;
  imei: string | null;
  color: string | null;
  complaint: string;
  status: string;
  priority: string;
  intakeDate: string;
  estimatedCompletion: string | null;
  technicianName: string | null;
  technicianId?: string;
  totalCost: number;
  paidAmount: number;
  unreadNotifications?: number;
  condition: string | null;
  accessories: string[];
  diagnosis: string | null;
  cause: string | null;
  recommendation: string | null;
  laborCost: number;
  partsCost: number;
  payments: Payment[];
  notifications: Notification[];
  history: StatusHistory[];
  outstandingBalance: number;
  delayReason?: string | null;
};

export type Payment = {
  id: string;
  amount: number;
  method: string;
  paidAt: string;
  receivedBy?: string;
};
export type Notification = {
  id: string;
  type: string;
  recipient: string;
  status: string;
  sentAt: string | null;
  message: string;
  error?: string | null;
};
export type StatusHistory = {
  id: string;
  status: string;
  at: string;
  actor: string;
  note?: string | null;
};
export type Customer = {
  id: string;
  storeId: string;
  name: string;
  whatsapp: string;
  email?: string | null;
  address?: string | null;
};

export type Store = {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  active: boolean;
};

const today = new Date().toISOString().slice(0, 10);
const iso = (hours: number) => new Date(Date.now() - hours * 3600000).toISOString();
const history = (entries: Array<[string, number, string, string?]>): StatusHistory[] =>
  entries.map(([status, ago, actor, note], index) => ({
    id: `hist-${index + 1}`,
    status,
    at: iso(ago),
    actor,
    note,
  }));

export const customers: Customer[] = [
  { id: "cus-001", storeId: "store-central", name: "Nadia Putri", whatsapp: "0812 8844 1290", email: "nadia@example.com", address: "Jakarta Selatan" },
  { id: "cus-002", storeId: "store-central", name: "Rizky Aditya", whatsapp: "0813 7002 1188", email: null, address: "Tangerang" },
  { id: "cus-003", storeId: "store-depok", name: "Dimas Pratama", whatsapp: "0821 4490 8821", email: "dimas@example.com", address: "Jakarta Timur" },
  { id: "cus-004", storeId: "store-depok", name: "Sari Wulandari", whatsapp: "0857 3321 0090", email: null, address: null },
];

export const stores: Store[] = [
  { id: "store-central", name: "Service Station Central", code: "ST-01", address: "Jl. Kemang Raya No. 18, Jakarta Selatan", phone: "021 7788 1200", active: true },
  { id: "store-depok", name: "Service Station Depok", code: "ST-02", address: "Jl. Margonda Raya No. 44, Depok", phone: "021 7788 1201", active: true },
];

export const tickets: RepairTicket[] = [
  {
    id: "tkt-001", storeId: "store-central", ticketNumber: `SRV-${today.replaceAll("-", "")}-0001`, customerName: "Nadia Putri", whatsapp: "0812 8844 1290",
    deviceBrand: "Apple", deviceModel: "iPhone 13 Pro", imei: "35 612345 901234 5", color: "Graphite", complaint: "Layar retak setelah terjatuh",
    status: "REPAIRING", priority: "HIGH", intakeDate: iso(25), estimatedCompletion: today, technicianName: "Bima Santoso", technicianId: "tech-001",
    totalCost: 2850000, paidAmount: 1000000, unreadNotifications: 1, condition: "Retak pada layar depan, frame kanan lecet",
    accessories: ["Case", "SIM card"], diagnosis: "LCD dan touch layer mengalami kerusakan", cause: "Benturan dari ketinggian",
    recommendation: "Ganti satu set display original", laborCost: 250000, partsCost: 2600000,
    payments: [{ id: "pay-001", amount: 1000000, method: "QRIS", paidAt: iso(23), receivedBy: "Ayu Rahma" }],
    notifications: [{ id: "notif-001", type: "TICKET_CREATED", recipient: "081288441290", status: "DELIVERED", sentAt: iso(25), message: "Your device has been received for repair." }],
    history: history([["DEVICE_RECEIVED", 25, "Ayu Rahma"], ["CHECKING", 22, "Bima Santoso"], ["WAITING_APPROVAL", 20, "Bima Santoso"], ["APPROVED", 18, "Ayu Rahma"], ["REPAIRING", 17, "Bima Santoso"]]),
    outstandingBalance: 1850000,
  },
  {
    id: "tkt-002", storeId: "store-central", ticketNumber: `SRV-${today.replaceAll("-", "")}-0002`, customerName: "Rizky Aditya", whatsapp: "0813 7002 1188",
    deviceBrand: "Samsung", deviceModel: "Galaxy S23", imei: "35 700011 222333 4", color: "Cream", complaint: "Baterai cepat habis dan ponsel panas",
    status: "WAITING_PART", priority: "NORMAL", intakeDate: iso(49), estimatedCompletion: "2026-08-21", technicianName: "Bima Santoso", technicianId: "tech-001",
    totalCost: 950000, paidAmount: 0, unreadNotifications: 0, condition: "Body baik, terdapat sedikit dent di sudut bawah",
    accessories: ["Charger"], diagnosis: "Kapasitas baterai turun di bawah 70%", cause: "Siklus baterai telah tinggi",
    recommendation: "Ganti baterai dan lakukan kalibrasi", laborCost: 150000, partsCost: 800000,
    payments: [], notifications: [{ id: "notif-002", type: "TICKET_CREATED", recipient: "081370021188", status: "DELIVERED", sentAt: iso(49), message: "Your device has been received for repair." }],
    history: history([["DEVICE_RECEIVED", 49, "Ayu Rahma"], ["CHECKING", 44, "Bima Santoso"], ["WAITING_PART", 30, "Bima Santoso", "Menunggu baterai Samsung S23"]]),
    outstandingBalance: 950000,
  },
  {
    id: "tkt-003", storeId: "store-depok", ticketNumber: `SRV-${today.replaceAll("-", "")}-0003`, customerName: "Dimas Pratama", whatsapp: "0821 4490 8821",
    deviceBrand: "Xiaomi", deviceModel: "14 Ultra", imei: "86 221100 778899 1", color: "Black", complaint: "Kamera tidak bisa fokus",
    status: "READY_PICKUP", priority: "NORMAL", intakeDate: iso(71), estimatedCompletion: "2026-08-19", technicianName: "Aldi Wijaya", technicianId: "tech-002",
    totalCost: 1250000, paidAmount: 1250000, unreadNotifications: 0, condition: "Kaca kamera tergores", accessories: ["Case", "Memory card"],
    diagnosis: "Modul kamera utama rusak", cause: "Kemasukan debu setelah benturan", recommendation: "Ganti modul kamera utama", laborCost: 200000, partsCost: 1050000,
    payments: [{ id: "pay-002", amount: 1250000, method: "Cash", paidAt: iso(3), receivedBy: "Ayu Rahma" }],
    notifications: [{ id: "notif-003", type: "READY_PICKUP", recipient: "082144908821", status: "DELIVERED", sentAt: iso(3), message: "Your device is ready for pickup." }],
    history: history([["DEVICE_RECEIVED", 71, "Ayu Rahma"], ["CHECKING", 68, "Aldi Wijaya"], ["REPAIRING", 55, "Aldi Wijaya"], ["COMPLETED", 5, "Aldi Wijaya"], ["READY_PICKUP", 3, "Ayu Rahma"]]),
    outstandingBalance: 0,
  },
  {
    id: "tkt-004", storeId: "store-depok", ticketNumber: `SRV-${today.replaceAll("-", "")}-0004`, customerName: "Sari Wulandari", whatsapp: "0857 3321 0090",
    deviceBrand: "OPPO", deviceModel: "Find X5 Pro", imei: "86 555500 111222 3", color: "White", complaint: "Tidak bisa menyala",
    status: "DELAYED", priority: "URGENT", intakeDate: iso(96), estimatedCompletion: "2026-08-20", technicianName: "Aldi Wijaya", technicianId: "tech-002",
    totalCost: 1750000, paidAmount: 500000, unreadNotifications: 1, condition: "Tidak ada kerusakan fisik terlihat", accessories: [],
    diagnosis: "Kerusakan pada IC power", cause: "Short circuit pada board", recommendation: "Board-level repair dan penggantian IC", laborCost: 450000, partsCost: 1300000,
    payments: [{ id: "pay-003", amount: 500000, method: "Bank Transfer", paidAt: iso(80), receivedBy: "Ayu Rahma" }],
    notifications: [{ id: "notif-004", type: "DELAYED", recipient: "085733210090", status: "FAILED", sentAt: null, message: "Your repair is taking longer than expected.", error: "WhatsApp provider timeout" }],
    history: history([["DEVICE_RECEIVED", 96, "Ayu Rahma"], ["CHECKING", 88, "Aldi Wijaya"], ["DELAYED", 8, "Aldi Wijaya", "Menunggu komponen IC power"]]),
    outstandingBalance: 1250000, delayReason: "Menunggu komponen IC power datang dari supplier",
  },
];

export const technicians = [
  { id: "tech-001", name: "Bima Santoso" },
  { id: "tech-002", name: "Aldi Wijaya" },
];

export function summarizeTicket(ticket: RepairTicket) {
  const { condition, accessories, diagnosis, cause, recommendation, laborCost, partsCost, payments, notifications, history, outstandingBalance, ...summary } = ticket;
  return summary;
}

export function findTicket(idOrNumber: string, storeId?: string) {
  return tickets.find((ticket) => (ticket.id === idOrNumber || ticket.ticketNumber === idOrNumber) && (!storeId || ticket.storeId === storeId));
}

export function detail(ticket: RepairTicket) {
  ticket.outstandingBalance = Math.max(0, ticket.totalCost - ticket.paidAmount);
  return ticket;
}