import { z } from "zod";
import { publicProcedure, protectedProcedure, router, adminProcedure } from "../_core/trpc";
import {
  createOrder,
  getOrderById,
  getOrderByNumber,
  getOrderItems,
  updateOrderStatus,
  updateOrderPaymentStatus,
  getOrdersByCustomer,
  getRecentOrders,
  getDb,
} from "../db";
import { orders, orderItems } from "../../drizzle/schema";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";

export const ordersRouter = router({
  // Create a new order
  create: publicProcedure
    .input(
      z.object({
        customerId: z.number().optional(),
        paymentMethod: z.enum(["pix", "cash", "debit", "credit"]),
        items: z.array(
          z.object({
            productId: z.number().optional(),
            comboId: z.number().optional(),
            quantity: z.number().min(1),
            unitPrice: z.string(),
          })
        ),
        subtotal: z.string(),
        discount: z.string().optional(),
        total: z.string(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const orderNumber = `ORD-${Date.now()}-${nanoid(6)}`;

      // Create order
      const result = await db.insert(orders).values({
        orderNumber,
        customerId: input.customerId || null,
        paymentMethod: input.paymentMethod,
        paymentStatus: "pending",
        status: "pending",
        subtotal: input.subtotal as any,
        discount: input.discount ? (input.discount as any) : "0",
        total: input.total as any,
        notes: input.notes || null,
      });

      // Get the inserted order ID
      const insertedOrder = await db
        .select()
        .from(orders)
        .where(eq(orders.orderNumber, orderNumber))
        .limit(1);

      if (!insertedOrder.length) throw new Error("Failed to create order");
      const orderId = insertedOrder[0].id;

      // Create order items
      for (const item of input.items) {
        await db.insert(orderItems).values({
          orderId: orderId as any,
          productId: item.productId || null,
          comboId: item.comboId || null,
          quantity: item.quantity,
          unitPrice: item.unitPrice as any,
          subtotal: (parseFloat(item.unitPrice) * item.quantity).toFixed(2) as any,
        });
      }

      return {
        orderId,
        orderNumber,
      };
    }),

  // Get order details
  get: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const order = await getOrderById(input.id);
      if (!order) return null;

      const items = await getOrderItems(input.id);
      return {
        ...order,
        items,
      };
    }),

  // Get order by order number
  getByNumber: publicProcedure
    .input(z.object({ orderNumber: z.string() }))
    .query(async ({ input }) => {
      const order = await getOrderByNumber(input.orderNumber);
      if (!order) return null;

      const items = await getOrderItems(order.id);
      return {
        ...order,
        items,
      };
    }),

  // Get customer's order history
  customerHistory: protectedProcedure
    .input(z.object({ customerId: z.number() }))
    .query(async ({ input }) => {
      return getOrdersByCustomer(input.customerId);
    }),

  // Update order status (admin/clerk only)
  updateStatus: protectedProcedure
    .input(
      z.object({
        orderId: z.number(),
        status: z.enum(["pending", "preparing", "ready", "completed", "cancelled"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin" && ctx.user.role !== "clerk") {
        throw new Error("Unauthorized");
      }
      return updateOrderStatus(input.orderId, input.status);
    }),

  // Update payment status
  updatePaymentStatus: protectedProcedure
    .input(
      z.object({
        orderId: z.number(),
        paymentStatus: z.enum(["pending", "completed", "failed"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin" && ctx.user.role !== "clerk") {
        throw new Error("Unauthorized");
      }
      return updateOrderPaymentStatus(input.orderId, input.paymentStatus);
    }),

  // Get recent orders (admin only)
  recent: adminProcedure
    .input(z.object({ limit: z.number().default(20) }))
    .query(async ({ input }) => {
      return getRecentOrders(input.limit);
    }),
});
