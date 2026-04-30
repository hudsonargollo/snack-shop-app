import { z } from "zod";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";
import { publicProcedure, router } from "../_core/trpc";
import { getDb, getUserByOpenId } from "../db";
import { users } from "../../drizzle/schema";
import { sdk } from "../_core/sdk";
import { getSessionCookieOptions } from "../_core/cookies";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { ENV } from "../_core/env";
import { TRPCError } from "@trpc/server";

export const authRouter = router({
  me: publicProcedure.query((opts) => opts.ctx.user),

  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return { success: true } as const;
  }),

  register: publicProcedure
    .input(
      z.object({
        name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
        email: z.string().email("E-mail inválido"),
        password: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco de dados indisponível" });

      // Check if email already exists
      const existing = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      if (existing.length > 0) {
        throw new TRPCError({ code: "CONFLICT", message: "Este e-mail já está cadastrado" });
      }

      const passwordHash = await bcrypt.hash(input.password, 12);
      const openId = `local_${nanoid(16)}`;

      // Auto-promote if this is the owner
      const role = openId === ENV.ownerOpenId ? "admin" : "user";

      await db.insert(users).values({
        openId,
        name: input.name,
        email: input.email,
        passwordHash,
        loginMethod: "password",
        role,
        lastSignedIn: new Date(),
      });

      const user = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      if (!user[0]) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Falha ao criar usuário" });

      // Issue session cookie
      const token = await sdk.createSessionToken(user[0].openId, {
        expiresInMs: ONE_YEAR_MS,
        name: user[0].name ?? "",
      });

      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, token, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });

      return { success: true, user: { id: user[0].id, name: user[0].name, email: user[0].email, role: user[0].role } };
    }),

  login: publicProcedure
    .input(
      z.object({
        email: z.string().email("E-mail inválido"),
        password: z.string().min(1, "Senha obrigatória"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco de dados indisponível" });

      const result = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      const user = result[0];

      if (!user || !user.passwordHash) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "E-mail ou senha incorretos" });
      }

      const valid = await bcrypt.compare(input.password, user.passwordHash);
      if (!valid) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "E-mail ou senha incorretos" });
      }

      // Auto-promote owner
      if (user.openId === ENV.ownerOpenId && user.role !== "admin") {
        await db.update(users).set({ role: "admin" }).where(eq(users.id, user.id));
        user.role = "admin";
      }

      // Update lastSignedIn
      await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, user.id));

      // Issue session cookie
      const token = await sdk.createSessionToken(user.openId, {
        expiresInMs: ONE_YEAR_MS,
        name: user.name ?? "",
      });

      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, token, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });

      return { success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
    }),
});
