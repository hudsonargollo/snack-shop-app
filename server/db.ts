import { eq, and, gte, lte, desc, asc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  categories,
  products,
  orders,
  orderItems,
  customers,
  combos,
  comboItems,
  loyaltyPrograms,
  loyaltyTransactions,
  raffles,
  raffleTickets,
  promotions,
  expenses,
  stockAdjustments,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ PRODUCTS ============

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getActiveProducts() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(products)
    .where(eq(products.isActive, true))
    .orderBy(asc(products.displayOrder), asc(products.id));
}

export async function getProductsByCategory(categoryId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(products)
    .where(and(eq(products.categoryId, categoryId), eq(products.isActive, true)))
    .orderBy(asc(products.displayOrder), asc(products.id));
}

export async function getLowStockProducts() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(products)
    .where(
      and(
        eq(products.isActive, true),
        sql`${products.stock} <= ${products.lowStockThreshold}`
      )
    );
}

// ============ CATEGORIES ============

export async function getCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).orderBy(asc(categories.displayOrder), asc(categories.id));
}

// ============ ORDERS ============

export async function createOrder(orderData: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(orders).values(orderData);
  return result;
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getOrderByNumber(orderNumber: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(orders)
    .where(eq(orders.orderNumber, orderNumber))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateOrderStatus(orderId: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(orders).set({ status: status as any }).where(eq(orders.id, orderId));
}

export async function updateOrderPaymentStatus(orderId: number, paymentStatus: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .update(orders)
    .set({ paymentStatus: paymentStatus as any })
    .where(eq(orders.id, orderId));
}

export async function getOrdersByCustomer(customerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(orders)
    .where(eq(orders.customerId, customerId))
    .orderBy(desc(orders.createdAt));
}

export async function getRecentOrders(limit: number = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).orderBy(desc(orders.createdAt)).limit(limit);
}

// ============ ORDER ITEMS ============

export async function getOrderItems(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

// ============ CUSTOMERS ============

export async function getOrCreateCustomer(email: string, name: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select()
    .from(customers)
    .where(eq(customers.email, email))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  const result = await db.insert(customers).values({
    name,
    email,
  });

  const newCustomer = await db
    .select()
    .from(customers)
    .where(eq(customers.email, email))
    .limit(1);

  return newCustomer[0];
}

export async function getCustomerById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateCustomerLoyaltyPoints(customerId: number, points: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .update(customers)
    .set({
      loyaltyPoints: sql`${customers.loyaltyPoints} + ${points}`,
    })
    .where(eq(customers.id, customerId));
}

// ============ COMBOS ============

export async function getActiveCombos() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(combos)
    .where(eq(combos.isActive, true))
    .orderBy(asc(combos.displayOrder), asc(combos.id));
}

export async function getComboById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(combos).where(eq(combos.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getComboItems(comboId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(comboItems).where(eq(comboItems.comboId, comboId));
}

// ============ LOYALTY PROGRAMS ============

export async function getActiveLoyaltyPrograms() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(loyaltyPrograms)
    .where(eq(loyaltyPrograms.isActive, true));
}

export async function getLoyaltyProgramById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(loyaltyPrograms)
    .where(eq(loyaltyPrograms.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============ RAFFLES ============

export async function getActiveRaffles() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(raffles)
    .where(eq(raffles.isActive, true))
    .orderBy(desc(raffles.createdAt));
}

export async function getRaffleByTriggerProduct(productName: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(raffles)
    .where(
      and(
        eq(raffles.triggerProductName, productName),
        eq(raffles.isActive, true)
      )
    )
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getRaffleTicketsByRaffle(raffleId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(raffleTickets).where(eq(raffleTickets.raffleId, raffleId));
}

// ============ PROMOTIONS ============

export async function getActivePromotions() {
  const db = await getDb();
  if (!db) return [];
  const now = new Date();
  return db
    .select()
    .from(promotions)
    .where(
      and(
        eq(promotions.isActive, true),
        lte(promotions.startDate, now),
        gte(promotions.endDate, now)
      )
    )
    .orderBy(asc(promotions.displayOrder), asc(promotions.id));
}

// ============ EXPENSES ============

export async function getExpensesByDateRange(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(expenses)
    .where(
      and(
        gte(expenses.expenseDate, startDate),
        lte(expenses.expenseDate, endDate)
      )
    )
    .orderBy(desc(expenses.expenseDate));
}

// ============ ANALYTICS ============

export async function getBestSellingProducts(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  const totalQty = sql<number>`SUM(${orderItems.quantity})`;
  return db
    .select({
      productId: orderItems.productId,
      productName: products.name,
      totalQuantity: totalQty,
      totalRevenue: sql<string>`SUM(${orderItems.subtotal})`,
    })
    .from(orderItems)
    .innerJoin(products, eq(orderItems.productId, products.id))
    .groupBy(orderItems.productId, products.name)
    .orderBy(totalQty)
    .limit(limit);
}

export async function getMostProfitableProducts(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  const totalProfit = sql<string>`SUM(${orderItems.subtotal} - (${orderItems.quantity} * ${products.costPrice}))`;
  return db
    .select({
      productId: orderItems.productId,
      productName: products.name,
      costPrice: products.costPrice,
      salePrice: products.salePrice,
      totalQuantity: sql<number>`SUM(${orderItems.quantity})`,
      totalRevenue: sql<string>`SUM(${orderItems.subtotal})`,
      totalCost: sql<string>`SUM(${orderItems.quantity} * ${products.costPrice})`,
      totalProfit,
    })
    .from(orderItems)
    .innerJoin(products, eq(orderItems.productId, products.id))
    .groupBy(orderItems.productId, products.name, products.costPrice, products.salePrice)
    .orderBy(desc(totalProfit))
    .limit(limit);
}

export async function getSalesAnalytics(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db)
    return {
      totalSales: 0,
      totalOrders: 0,
      totalProfit: 0,
      averageOrderValue: 0,
    };

  const result = await db
    .select({
      totalSales: sql<string>`SUM(${orders.total})`,
      totalOrders: sql<number>`COUNT(DISTINCT ${orders.id})`,
      totalCost: sql<string>`SUM(${orderItems.quantity} * ${products.costPrice})`,
    })
    .from(orders)
    .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
    .leftJoin(products, eq(orderItems.productId, products.id))
    .where(
      and(
        gte(orders.createdAt, startDate),
        lte(orders.createdAt, endDate),
        eq(orders.paymentStatus, "completed")
      )
    );

  const data = result[0];
  const totalSales = parseFloat(data?.totalSales || "0");
  const totalOrders = data?.totalOrders || 0;
  const totalCost = parseFloat(data?.totalCost || "0");

  return {
    totalSales,
    totalOrders,
    totalProfit: totalSales - totalCost,
    averageOrderValue: totalOrders > 0 ? totalSales / totalOrders : 0,
  };
}
