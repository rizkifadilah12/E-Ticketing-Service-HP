import { Router, type IRouter } from "express";
import { randomBytes, randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import {
  CreateAdminStoreBody,
  CreateStoreOperatorBody,
  CreateStoreOperatorParams,
  UpdateStoreMembershipBody,
  UpdateStoreMembershipParams,
} from "@workspace/api-zod";
import {
  db,
  hashPassword,
  storeMembers,
  stores,
  users,
} from "@workspace/db";
import { requireAdmin, requireAuth } from "../lib/auth";
import { membershipFields, toStoreDto } from "../lib/membership";

const router: IRouter = Router();
router.use(requireAuth, requireAdmin);

async function adminStoreDto(storeId: string) {
  const [store] = await db.select().from(stores).where(eq(stores.id, storeId));
  if (!store) return null;
  const members = await db
    .select()
    .from(storeMembers)
    .where(eq(storeMembers.storeId, storeId));
  const userRows =
    members.length === 0
      ? []
      : await db.select().from(users);
  const operators = userRows
    .filter((user) => members.some((member) => member.userId === user.id))
    .map((user) => ({ id: user.id, name: user.name, email: user.email }));
  return { ...toStoreDto(store), operators };
}

router.get("/stores", async (_req, res) => {
  const rows = await db.select().from(stores);
  const payload = [];
  for (const store of rows) {
    const dto = await adminStoreDto(store.id);
    if (dto) payload.push(dto);
  }
  return res.json(payload);
});

router.post("/stores", async (req, res) => {
  const body = CreateAdminStoreBody.parse(req.body);
  const code = body.code.trim().toUpperCase();
  const email = body.operatorEmail.trim().toLowerCase();

  const [codeTaken] = await db.select().from(stores).where(eq(stores.code, code));
  if (codeTaken) {
    return res.status(409).json({ error: "Kode toko sudah dipakai" });
  }
  const [emailTaken] = await db.select().from(users).where(eq(users.email, email));
  if (emailTaken) {
    return res.status(409).json({ error: "Email operator sudah dipakai" });
  }

  const storeId = `store-${randomBytes(4).toString("hex")}`;
  const userId = `user-${randomBytes(4).toString("hex")}`;
  const fields = membershipFields(
    body.membershipPlan,
    body.membershipExpiresAt,
  );

  await db.insert(stores).values({
    id: storeId,
    name: body.name.trim(),
    code,
    address: body.address.trim(),
    phone: body.phone.trim(),
    ...fields,
  });
  await db.insert(users).values({
    id: userId,
    email,
    name: body.operatorName.trim(),
    role: "store_operator",
    passwordHash: await hashPassword(body.operatorPassword),
  });
  await db.insert(storeMembers).values({
    id: randomUUID(),
    storeId,
    userId,
  });

  return res.status(201).json(await adminStoreDto(storeId));
});

router.patch("/stores/:id/membership", async (req, res) => {
  const params = UpdateStoreMembershipParams.parse(req.params);
  const body = UpdateStoreMembershipBody.parse(req.body);
  const [store] = await db.select().from(stores).where(eq(stores.id, params.id));
  if (!store) return res.status(404).json({ error: "Store not found" });

  const fields = membershipFields(
    body.membershipPlan,
    body.membershipExpiresAt,
  );
  await db.update(stores).set(fields).where(eq(stores.id, params.id));
  return res.json(await adminStoreDto(params.id));
});

router.post("/stores/:id/operators", async (req, res) => {
  const params = CreateStoreOperatorParams.parse(req.params);
  const body = CreateStoreOperatorBody.parse(req.body);
  const [store] = await db.select().from(stores).where(eq(stores.id, params.id));
  if (!store) return res.status(404).json({ error: "Store not found" });

  const email = body.email.trim().toLowerCase();
  const [emailTaken] = await db.select().from(users).where(eq(users.email, email));
  if (emailTaken) {
    return res.status(409).json({ error: "Email sudah dipakai" });
  }

  const userId = `user-${randomBytes(4).toString("hex")}`;
  await db.insert(users).values({
    id: userId,
    email,
    name: body.name.trim(),
    role: "store_operator",
    passwordHash: await hashPassword(body.password),
  });
  await db.insert(storeMembers).values({
    id: randomUUID(),
    storeId: store.id,
    userId,
  });

  return res.status(201).json({
    id: userId,
    name: body.name.trim(),
    email,
  });
});

export default router;
