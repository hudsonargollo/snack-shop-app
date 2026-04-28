import { describe, it, expect, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(role: "admin" | "clerk" | "user" = "user"): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "password",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };

  return { ctx };
}

describe("Orders API", () => {
  it("should create an order with items", async () => {
    const { ctx } = createAuthContext("user");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.orders.create({
      paymentMethod: "pix",
      items: [
        {
          productId: 1,
          quantity: 2,
          unitPrice: "25.00",
        },
      ],
      subtotal: "50.00",
      total: "50.00",
    });

    expect(result).toHaveProperty("orderId");
    expect(result).toHaveProperty("orderNumber");
    expect(result.orderNumber).toMatch(/^ORD-/);
  });

  it("should allow clerk to update order status", async () => {
    const { ctx } = createAuthContext("clerk");
    const caller = appRouter.createCaller(ctx);

    // First create an order
    const orderResult = await caller.orders.create({
      paymentMethod: "cash",
      items: [
        {
          productId: 1,
          quantity: 1,
          unitPrice: "15.00",
        },
      ],
      subtotal: "15.00",
      total: "15.00",
    });

    // Then update its status
    const updateResult = await caller.orders.updateStatus({
      orderId: orderResult.orderId,
      status: "preparing",
    });

    expect(updateResult).toBeDefined();
  });

  it("should prevent non-admin from updating order status", async () => {
    const { ctx } = createAuthContext("user");
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.orders.updateStatus({
        orderId: 1,
        status: "preparing",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toContain("Unauthorized");
    }
  });

  it("should allow admin to view recent orders", async () => {
    const { ctx } = createAuthContext("admin");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.orders.recent({ limit: 10 });
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("Products API", () => {
  it("should list active products", async () => {
    const { ctx } = createAuthContext("user");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.products.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should get product categories", async () => {
    const { ctx } = createAuthContext("user");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.products.categories();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should filter products by category", async () => {
    const { ctx } = createAuthContext("user");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.products.byCategory({ categoryId: 1 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("should only allow admin to view low stock products", async () => {
    const { ctx } = createAuthContext("user");
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.products.lowStock();
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });
});

describe("Customers API", () => {
  it("should create or get customer by email", async () => {
    const { ctx } = createAuthContext("user");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.customers.getOrCreate({
      email: "customer@example.com",
      name: "John Doe",
    });

    expect(result).toHaveProperty("id");
    expect(result.email).toBe("customer@example.com");
    expect(result.name).toBe("John Doe");
  });

  it("should get loyalty programs", async () => {
    const { ctx } = createAuthContext("user");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.customers.loyaltyPrograms();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should allow admin to create loyalty program", async () => {
    const { ctx } = createAuthContext("admin");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.customers.createLoyaltyProgram({
      name: "Buy 10 Get 1 Free",
      description: "Purchase 10 items to get 1 free",
      rewardType: "freeItem",
      triggerType: "purchase_count",
      triggerValue: 10,
      rewardValue: "1",
    });

    expect(result.success).toBe(true);
  });
});

describe("Raffles API", () => {
  it("should get active raffles", async () => {
    const { ctx } = createAuthContext("user");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.raffles.active();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should find raffle by product name", async () => {
    const { ctx } = createAuthContext("user");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.raffles.byProduct({ productName: "SANDUÍCHE NATURAL" });
    // Result can be null if no raffle exists
    expect(result === null || typeof result === "object").toBe(true);
  });

  it("should allow admin to create raffle", async () => {
    const { ctx } = createAuthContext("admin");
    const caller = appRouter.createCaller(ctx);

    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);

    const result = await caller.raffles.create({
      name: "SANDUÍCHE NATURAL Raffle",
      description: "Win a prize with SANDUÍCHE NATURAL purchases",
      triggerProductName: "SANDUÍCHE NATURAL",
      startDate,
      endDate,
      winnerCount: 5,
      prize: "Gift Card R$ 100",
    });

    expect(result.success).toBe(true);
  });
});

describe("Analytics API", () => {
  it("should allow admin to view best sellers", async () => {
    const { ctx } = createAuthContext("admin");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.analytics.bestSellers({ limit: 10 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("should allow admin to view most profitable products", async () => {
    const { ctx } = createAuthContext("admin");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.analytics.mostProfitable({ limit: 10 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("should allow admin to view sales trends", async () => {
    const { ctx } = createAuthContext("admin");
    const caller = appRouter.createCaller(ctx);

    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = new Date();

    const result = await caller.analytics.salesTrends({ startDate, endDate });
    expect(result).toHaveProperty("totalSales");
    expect(result).toHaveProperty("totalOrders");
    expect(result).toHaveProperty("totalProfit");
    expect(result).toHaveProperty("averageOrderValue");
  });

  it("should prevent non-admin from viewing analytics", async () => {
    const { ctx } = createAuthContext("user");
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.analytics.bestSellers({ limit: 10 });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });
});
