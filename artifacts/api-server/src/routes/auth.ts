import { Router, type IRouter } from "express";
import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import {
  db,
  hashPassword,
  sessions,
  users,
  verifyPassword,
} from "@workspace/db";
import { LoginBody } from "@workspace/api-zod";
import {
  requireAuth,
  SESSION_COOKIE,
  sessionCookieOptions,
  storesForUser,
} from "../lib/auth";
import { toStoreDto } from "../lib/membership";

const router: IRouter = Router();

async function sessionPayload(user: {
  id: string;
  name: string;
  email: string;
  role: string;
}) {
  const storeRows = await storesForUser(user);
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    stores: storeRows.map(toStoreDto),
  };
}

router.post("/auth/login", async (req, res) => {
  const body = LoginBody.parse(req.body);
  const email = body.email.trim().toLowerCase();
  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
    return res.status(401).json({ error: "Email atau password salah" });
  }

  const sessionId = randomBytes(24).toString("hex");
  await db.insert(sessions).values({
    id: sessionId,
    userId: user.id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
  res.cookie(SESSION_COOKIE, sessionId, sessionCookieOptions());
  return res.json(await sessionPayload(user));
});

router.post("/auth/logout", async (req, res) => {
  const token = req.cookies?.[SESSION_COOKIE];
  if (token) {
    await db.delete(sessions).where(eq(sessions.id, token));
  }
  res.clearCookie(SESSION_COOKIE, { path: "/" });
  return res.status(204).end();
});

router.get("/auth/me", requireAuth, async (req, res) => {
  return res.json(await sessionPayload(req.user!));
});

router.get("/stores", requireAuth, async (req, res) => {
  const storeRows = await storesForUser(req.user!);
  return res.json(storeRows.map(toStoreDto));
});

export default router;
