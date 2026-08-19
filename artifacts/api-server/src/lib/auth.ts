import type { NextFunction, Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db, sessions, storeMembers, stores, users } from "@workspace/db";
import { isStoreActive } from "./membership";

export const SESSION_COOKIE = "eticket_session";
const SESSION_DAYS = 7;

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: string;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      storeId?: string;
    }
  }
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60 * 1000,
  };
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.cookies?.[SESSION_COOKIE];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, token));
  if (!session || session.expiresAt.getTime() < Date.now()) {
    res.clearCookie(SESSION_COOKIE, { path: "/" });
    return res.status(401).json({ error: "Unauthorized" });
  }

  const [user] = await db.select().from(users).where(eq(users.id, session.userId));
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  req.user = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
  return next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== "platform_admin") {
    return res.status(403).json({ error: "Admin only" });
  }
  return next();
}

export async function resolveStore(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (user.role === "platform_admin") {
    return res.status(403).json({
      error: "Admin only manages membership",
      message: "Platform admin tidak mengoperasikan tiket toko.",
    });
  }

  const [member] = await db
    .select({ storeId: storeMembers.storeId })
    .from(storeMembers)
    .where(eq(storeMembers.userId, user.id))
    .limit(1);
  const storeId = member?.storeId;

  if (!storeId) {
    return res.status(400).json({ error: "No store available" });
  }

  const [store] = await db.select().from(stores).where(eq(stores.id, storeId));
  if (!store) {
    return res.status(404).json({ error: "Store not found" });
  }

  if (!isStoreActive(store)) {
    return res.status(403).json({
      error: "STORE_INACTIVE",
      message:
        "Toko ini tidak aktif karena membership belum dibayar atau sudah berakhir.",
    });
  }

  req.storeId = storeId;
  return next();
}

export async function storesForUser(user: AuthUser) {
  if (user.role === "platform_admin") {
    return db.select().from(stores);
  }

  const members = await db
    .select()
    .from(storeMembers)
    .where(eq(storeMembers.userId, user.id));
  if (members.length === 0) return [];

  const ids = members.map((member) => member.storeId);
  const rows = await db.select().from(stores);
  return rows.filter((store) => ids.includes(store.id));
}
