import { z } from "zod";
import { publicProcedure, protectedProcedure, router, adminProcedure } from "../_core/trpc";
import {
  getOrCreateCustomer,
  getCustomerById,
  updateCustomerLoyaltyPoints,
  getActiveLoyaltyPrograms,
  getLoyaltyProgramById,
  getDb,
} from "../db";
import { customers, loyaltyTransactions, loyaltyPrograms } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const customersRouter = router({
  // Get or create customer
  getOrCreate: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        name: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return getOrCreateCustomer(input.email, input.name);
    }),

  // Get customer details
  get: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return getCustomerById(input.id);
    }),

  // Get loyalty programs
  loyaltyPrograms: publicProcedure.query(async () => {
    return getActiveLoyaltyPrograms();
  }),

  // Get loyalty program details
  loyaltyProgramDetails: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return getLoyaltyProgramById(input.id);
    }),

  // Add loyalty points to customer
  addLoyaltyPoints: protectedProcedure
    .input(
      z.object({
        customerId: z.number(),
        points: z.number(),
        orderId: z.number().optional(),
        loyaltyProgramId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin" && ctx.user.role !== "clerk") {
        throw new Error("Unauthorized");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Update customer loyalty points
      await updateCustomerLoyaltyPoints(input.customerId, input.points);

      // Record transaction
      await db.insert(loyaltyTransactions).values({
        customerId: input.customerId,
        loyaltyProgramId: input.loyaltyProgramId || null,
        orderId: input.orderId || null,
        transactionType: "earn",
        pointsAmount: input.points,
        rewardApplied: null,
      });

      return { success: true };
    }),

  // Redeem loyalty points
  redeemPoints: protectedProcedure
    .input(
      z.object({
        customerId: z.number(),
        points: z.number(),
        rewardDescription: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin" && ctx.user.role !== "clerk") {
        throw new Error("Unauthorized");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const customer = await getCustomerById(input.customerId);
      if (!customer || customer.loyaltyPoints < input.points) {
        throw new Error("Insufficient loyalty points");
      }

      // Update customer loyalty points (subtract)
      await updateCustomerLoyaltyPoints(input.customerId, -input.points);

      // Record transaction
      await db.insert(loyaltyTransactions).values({
        customerId: input.customerId,
        loyaltyProgramId: null,
        orderId: null,
        transactionType: "redeem",
        pointsAmount: input.points,
        rewardApplied: input.rewardDescription,
      });

      return { success: true };
    }),

  // Create loyalty program (admin only)
  createLoyaltyProgram: adminProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        rewardType: z.enum(["points", "discount", "freeItem"]),
        triggerType: z.enum(["purchase_amount", "purchase_count", "points_threshold"]),
        triggerValue: z.number(),
        rewardValue: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db.insert(loyaltyPrograms).values({
        name: input.name,
        description: input.description || null,
        rewardType: input.rewardType,
        triggerType: input.triggerType,
        triggerValue: input.triggerValue,
        rewardValue: input.rewardValue as any,
        isActive: true,
      });

      return { success: true };
    }),
});
