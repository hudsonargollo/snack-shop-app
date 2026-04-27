import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getOrderById, updateOrderPaymentStatus, getDb } from "../db";
import axios from "axios";

const MERCADO_PAGO_API = "https://api.mercadopago.com/v1";

export const paymentsRouter = router({
  // Create PIX payment
  createPixPayment: publicProcedure
    .input(
      z.object({
        orderId: z.number(),
        amount: z.string(),
        description: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
      if (!accessToken) {
        throw new Error("Mercado Pago credentials not configured");
      }

      try {
        const response = await axios.post(
          `${MERCADO_PAGO_API}/payments`,
          {
            transaction_amount: parseFloat(input.amount),
            description: input.description,
            payment_method_id: "pix",
            payer: {
              email: "customer@example.com",
            },
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        const paymentId = response.data.id;

        // Update order with Mercado Pago payment ID
        const db = await getDb();
        if (db) {
          const { orders } = await import("../../drizzle/schema");
          const { eq } = await import("drizzle-orm");
          await db
            .update(orders)
            .set({ mercadoPagoPaymentId: paymentId.toString() })
            .where(eq(orders.id, input.orderId));
        }

        return {
          paymentId,
          qrCode: response.data.point_of_interaction?.qr_code?.in_store_order_id,
          status: response.data.status,
        };
      } catch (error: any) {
        console.error("Mercado Pago error:", error.response?.data || error.message);
        throw new Error("Failed to create PIX payment");
      }
    }),

  // Poll payment status
  pollPaymentStatus: publicProcedure
    .input(
      z.object({
        paymentId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
      if (!accessToken) {
        throw new Error("Mercado Pago credentials not configured");
      }

      try {
        const response = await axios.get(
          `${MERCADO_PAGO_API}/payments/${input.paymentId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        return {
          status: response.data.status,
          statusDetail: response.data.status_detail,
          approved: response.data.status === "approved",
        };
      } catch (error: any) {
        console.error("Mercado Pago error:", error.response?.data || error.message);
        throw new Error("Failed to check payment status");
      }
    }),

  // Confirm payment (update order status)
  confirmPayment: publicProcedure
    .input(
      z.object({
        orderId: z.number(),
        paymentStatus: z.enum(["completed", "failed"]),
      })
    )
    .mutation(async ({ input }) => {
      await updateOrderPaymentStatus(input.orderId, input.paymentStatus);

      return {
        success: true,
        message:
          input.paymentStatus === "completed"
            ? "Payment confirmed successfully"
            : "Payment failed",
      };
    }),
});
