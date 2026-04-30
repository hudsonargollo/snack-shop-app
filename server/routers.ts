import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { productsRouter } from "./routers/products";
import { ordersRouter } from "./routers/orders";
import { customersRouter } from "./routers/customers";
import { rafflesRouter } from "./routers/raffles";
import { paymentsRouter } from "./routers/payments";
import { analyticsRouter } from "./routers/analytics";
import { authRouter } from "./routers/auth";

export const appRouter = router({
  system: systemRouter,
  auth: authRouter,

  // Feature routers
  products: productsRouter,
  orders: ordersRouter,
  customers: customersRouter,
  raffles: rafflesRouter,
  payments: paymentsRouter,
  analytics: analyticsRouter,
});

export type AppRouter = typeof appRouter;
