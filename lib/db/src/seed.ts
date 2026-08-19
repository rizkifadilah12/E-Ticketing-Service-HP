import { eq } from "drizzle-orm";
import { loadWorkspaceEnv } from "./load-env";

loadWorkspaceEnv();

const { db } = await import("./index");
const { hashPassword } = await import("./password");
const { users, stores, storeMembers } = await import("./schema");

async function upsertUser(row: typeof users.$inferInsert) {
  const existing = await db.select().from(users).where(eq(users.email, row.email));
  if (existing[0]) {
    await db
      .update(users)
      .set({
        name: row.name,
        role: row.role,
        passwordHash: row.passwordHash,
      })
      .where(eq(users.id, existing[0].id));
    return existing[0].id;
  }
  await db.insert(users).values(row);
  return row.id;
}

async function upsertStore(row: typeof stores.$inferInsert) {
  const existing = await db.select().from(stores).where(eq(stores.id, row.id));
  if (existing[0]) {
    await db.update(stores).set(row).where(eq(stores.id, row.id));
    return;
  }
  await db.insert(stores).values(row);
}

async function ensureMember(id: string, storeId: string, userId: string) {
  const existing = await db
    .select()
    .from(storeMembers)
    .where(eq(storeMembers.userId, userId));
  if (existing.some((member) => member.storeId === storeId)) return;
  await db.insert(storeMembers).values({ id, storeId, userId });
}

const password = await hashPassword("Store123!");
const adminPassword = await hashPassword("Admin123!");

const adminId = await upsertUser({
  id: "user-admin",
  email: "admin@eticketing.local",
  passwordHash: adminPassword,
  name: "Platform Admin",
  role: "platform_admin",
});

const centralUserId = await upsertUser({
  id: "user-central",
  email: "central@eticketing.local",
  passwordHash: password,
  name: "Ayu Rahma",
  role: "store_operator",
});

const depokUserId = await upsertUser({
  id: "user-depok",
  email: "depok@eticketing.local",
  passwordHash: password,
  name: "Raka Pratama",
  role: "store_operator",
});

await upsertStore({
  id: "store-central",
  name: "Service Station Central",
  code: "ST-01",
  address: "Jl. Kemang Raya No. 18, Jakarta Selatan",
  phone: "021 7788 1200",
  membershipPlan: "lifetime",
  membershipExpiresAt: null,
  active: true,
});

await upsertStore({
  id: "store-depok",
  name: "Service Station Depok",
  code: "ST-02",
  address: "Jl. Margonda Raya No. 44, Depok",
  phone: "021 7788 1201",
  membershipPlan: "unpaid",
  membershipExpiresAt: null,
  active: false,
});

await ensureMember("member-central", "store-central", centralUserId);
await ensureMember("member-depok", "store-depok", depokUserId);

console.log("Seeded users and stores.");
console.log("Admin:  admin@eticketing.local / Admin123!");
console.log("Central (lifetime): central@eticketing.local / Store123!");
console.log("Depok (unpaid):     depok@eticketing.local / Store123!");

process.exit(0);
