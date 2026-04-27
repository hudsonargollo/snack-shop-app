import { z } from "zod";
import { router, adminProcedure } from "../_core/trpc";
import {
  getBestSellingProducts,
  getMostProfitableProducts,
  getSalesAnalytics,
  getExpensesByDateRange,
} from "../db";

export const analyticsRouter = router({
  // Get best-selling products
  bestSellers: adminProcedure
    .input(z.object({ limit: z.number().default(10) }))
    .query(async ({ input }) => {
      return getBestSellingProducts(input.limit);
    }),

  // Get most profitable products
  mostProfitable: adminProcedure
    .input(z.object({ limit: z.number().default(10) }))
    .query(async ({ input }) => {
      return getMostProfitableProducts(input.limit);
    }),

  // Get sales analytics for date range
  salesTrends: adminProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(async ({ input }) => {
      return getSalesAnalytics(input.startDate, input.endDate);
    }),

  // Get expenses for date range
  expenses: adminProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(async ({ input }) => {
      return getExpensesByDateRange(input.startDate, input.endDate);
    }),
});
