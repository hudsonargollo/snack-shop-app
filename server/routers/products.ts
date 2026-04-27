import { z } from "zod";
import { publicProcedure, protectedProcedure, router, adminProcedure } from "../_core/trpc";
import {
  getActiveProducts,
  getProductsByCategory,
  getProductById,
  getLowStockProducts,
  getCategories,
  getActiveCombos,
  getComboById,
  getComboItems,
  getActivePromotions,
} from "../db";

export const productsRouter = router({
  // Get all active products
  list: publicProcedure.query(async () => {
    return getActiveProducts();
  }),

  // Get products by category
  byCategory: publicProcedure
    .input(z.object({ categoryId: z.number() }))
    .query(async ({ input }) => {
      return getProductsByCategory(input.categoryId);
    }),

  // Get product details
  get: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return getProductById(input.id);
    }),

  // Get all categories
  categories: publicProcedure.query(async () => {
    return getCategories();
  }),

  // Get active combos
  combos: publicProcedure.query(async () => {
    return getActiveCombos();
  }),

  // Get combo details with items
  comboDetails: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const combo = await getComboById(input.id);
      if (!combo) return null;

      const items = await getComboItems(input.id);
      return {
        ...combo,
        items,
      };
    }),

  // Get active promotions
  promotions: publicProcedure.query(async () => {
    return getActivePromotions();
  }),

  // Get low stock products (admin only)
  lowStock: adminProcedure.query(async () => {
    return getLowStockProducts();
  }),
});
