import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { supabaseAdmin } from "./supabase";
import { getDb, upsertUser, getUserByOpenId } from "../db";
import { ENV } from "./env";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

async function getUserFromRequest(req: CreateExpressContextOptions["req"]): Promise<User | null> {
  // Extract Bearer token from Authorization header or cookie
  let token: string | null = null;

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.slice(7);
  }

  // Also check cookie fallback
  if (!token && req.headers.cookie) {
    const match = req.headers.cookie.match(/sb-access-token=([^;]+)/);
    if (match) token = decodeURIComponent(match[1]);
  }

  if (!token || !supabaseAdmin) return null;

  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data.user) return null;

    const supaUser = data.user;
    const openId = `supabase_${supaUser.id}`;

    // Sync user to our users table
    await upsertUser({
      openId,
      name: supaUser.user_metadata?.name ?? supaUser.email ?? null,
      email: supaUser.email ?? null,
      whatsapp: supaUser.user_metadata?.whatsapp ?? null,
      loginMethod: supaUser.app_metadata?.provider ?? "password",
      lastSignedIn: new Date(),
    });

    return await getUserByOpenId(openId) ?? null;
  } catch {
    return null;
  }
}

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  const user = await getUserFromRequest(opts.req).catch(() => null);

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
