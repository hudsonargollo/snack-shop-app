import { z } from "zod";
import { publicProcedure, protectedProcedure, router, adminProcedure } from "../_core/trpc";
import {
  getActiveRaffles,
  getRaffleByTriggerProduct,
  getRaffleTicketsByRaffle,
  getDb,
} from "../db";
import { raffles, raffleTickets } from "../../drizzle/schema";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";

export const rafflesRouter = router({
  // Get active raffles
  active: publicProcedure.query(async () => {
    return getActiveRaffles();
  }),

  // Get raffle by trigger product (e.g., "SANDUÍCHE NATURAL")
  byProduct: publicProcedure
    .input(z.object({ productName: z.string() }))
    .query(async ({ input }) => {
      return getRaffleByTriggerProduct(input.productName);
    }),

  // Issue raffle ticket for customer (called when SANDUÍCHE NATURAL is purchased)
  issueTicket: protectedProcedure
    .input(
      z.object({
        raffleId: z.number(),
        customerId: z.number(),
        orderId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const ticketNumber = `RAFFLE-${Date.now()}-${nanoid(8)}`;

      const result = await db.insert(raffleTickets).values({
        raffleId: input.raffleId,
        customerId: input.customerId,
        orderId: input.orderId,
        ticketNumber,
        isWinner: false,
      });

      return {
        ticketNumber,
        success: true,
      };
    }),

  // Get raffle tickets (admin only)
  tickets: adminProcedure
    .input(z.object({ raffleId: z.number() }))
    .query(async ({ input }) => {
      return getRaffleTicketsByRaffle(input.raffleId);
    }),

  // Create raffle (admin only)
  create: adminProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        triggerProductName: z.string(),
        startDate: z.date(),
        endDate: z.date(),
        winnerCount: z.number().default(1),
        prize: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db.insert(raffles).values({
        name: input.name,
        description: input.description || null,
        triggerProductName: input.triggerProductName,
        startDate: input.startDate as any,
        endDate: input.endDate as any,
        winnerCount: input.winnerCount,
        prize: input.prize || null,
        isActive: true,
      });

      return { success: true };
    }),

  // Draw raffle winners (admin only)
  drawWinners: adminProcedure
    .input(z.object({ raffleId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get raffle details
      const raffleResult = await db
        .select()
        .from(raffles)
        .where(eq(raffles.id, input.raffleId))
        .limit(1);

      if (!raffleResult.length) throw new Error("Raffle not found");

      const raffle = raffleResult[0];
      const tickets = await getRaffleTicketsByRaffle(input.raffleId);

      if (tickets.length === 0) throw new Error("No tickets for this raffle");

      // Randomly select winners
      const winnerCount = Math.min(raffle.winnerCount, tickets.length);
      const shuffled = [...tickets].sort(() => Math.random() - 0.5);
      const winners = shuffled.slice(0, winnerCount);

      // Mark winners
      for (const winner of winners) {
        await db
          .update(raffleTickets)
          .set({ isWinner: true })
          .where(eq(raffleTickets.id, winner.id));
      }

      return {
        winners: winners.map((w) => ({
          ticketNumber: w.ticketNumber,
          customerId: w.customerId,
        })),
      };
    }),

  // Update raffle (admin only)
  update: adminProcedure
    .input(
      z.object({
        raffleId: z.number(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(raffles)
        .set({ isActive: input.isActive })
        .where(eq(raffles.id, input.raffleId));

      return { success: true };
    }),
});
