import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  json,
  datetime,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with role-based access control for admin, clerk, and customer roles.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["admin", "clerk", "user"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Product categories for menu organization
 */
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: text("description"),
  iconUrl: text("iconUrl"), // URL to circle icon
  displayOrder: int("displayOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

/**
 * Products with pricing, cost, and stock tracking
 */
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  categoryId: int("categoryId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: text("imageUrl"), // Product image URL
  costPrice: decimal("costPrice", { precision: 10, scale: 2 }).notNull(), // Cost of goods
  salePrice: decimal("salePrice", { precision: 10, scale: 2 }).notNull(), // Selling price
  stock: int("stock").default(0).notNull(),
  lowStockThreshold: int("lowStockThreshold").default(5).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  displayOrder: int("displayOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Combos - bundles of multiple products with custom pricing
 */
export const combos = mysqlTable("combos", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: text("imageUrl"),
  basePrice: decimal("basePrice", { precision: 10, scale: 2 }).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  displayOrder: int("displayOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Combo = typeof combos.$inferSelect;
export type InsertCombo = typeof combos.$inferInsert;

/**
 * Combo items - products included in a combo
 */
export const comboItems = mysqlTable("comboItems", {
  id: int("id").autoincrement().primaryKey(),
  comboId: int("comboId").notNull(),
  productId: int("productId").notNull(),
  quantity: int("quantity").default(1).notNull(),
  priceAdjustment: decimal("priceAdjustment", { precision: 10, scale: 2 }).default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ComboItem = typeof comboItems.$inferSelect;
export type InsertComboItem = typeof comboItems.$inferInsert;

/**
 * Orders - customer purchases
 */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customerId"),
  orderNumber: varchar("orderNumber", { length: 50 }).notNull().unique(),
  status: mysqlEnum("status", ["pending", "preparing", "ready", "completed", "cancelled"])
    .default("pending")
    .notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["pix", "cash", "debit", "credit"]).notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "completed", "failed"]).default("pending").notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 10, scale: 2 }).default(0).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  mercadoPagoPaymentId: varchar("mercadoPagoPaymentId", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Order items - individual products/combos in an order
 */
export const orderItems = mysqlTable("orderItems", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  productId: int("productId"),
  comboId: int("comboId"),
  quantity: int("quantity").default(1).notNull(),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

/**
 * Customers - registered users with loyalty tracking
 */
export const customers = mysqlTable("customers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).unique(),
  phone: varchar("phone", { length: 20 }),
  loyaltyPoints: int("loyaltyPoints").default(0).notNull(),
  totalSpent: decimal("totalSpent", { precision: 12, scale: 2 }).default(0).notNull(),
  totalOrders: int("totalOrders").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

/**
 * Loyalty programs - configurable reward campaigns
 */
export const loyaltyPrograms = mysqlTable("loyaltyPrograms", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  rewardType: mysqlEnum("rewardType", ["points", "discount", "freeItem"]).notNull(),
  triggerType: mysqlEnum("triggerType", ["purchase_amount", "purchase_count", "points_threshold"]).notNull(),
  triggerValue: int("triggerValue").default(0).notNull(), // e.g., 10 for "buy 10", 100 for "$100 spent"
  rewardValue: decimal("rewardValue", { precision: 10, scale: 2 }).notNull(), // e.g., 1 free item or $10 discount
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LoyaltyProgram = typeof loyaltyPrograms.$inferSelect;
export type InsertLoyaltyProgram = typeof loyaltyPrograms.$inferInsert;

/**
 * Customer loyalty transactions - track points and rewards
 */
export const loyaltyTransactions = mysqlTable("loyaltyTransactions", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customerId").notNull(),
  loyaltyProgramId: int("loyaltyProgramId"),
  orderId: int("orderId"),
  transactionType: mysqlEnum("transactionType", ["earn", "redeem"]).notNull(),
  pointsAmount: int("pointsAmount").notNull(),
  rewardApplied: text("rewardApplied"), // JSON description of reward
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LoyaltyTransaction = typeof loyaltyTransactions.$inferSelect;
export type InsertLoyaltyTransaction = typeof loyaltyTransactions.$inferInsert;

/**
 * Raffle tickets - issued for SANDUÍCHE NATURAL purchases
 */
export const raffleTickets = mysqlTable("raffleTickets", {
  id: int("id").autoincrement().primaryKey(),
  raffleId: int("raffleId").notNull(),
  customerId: int("customerId").notNull(),
  orderId: int("orderId").notNull(),
  ticketNumber: varchar("ticketNumber", { length: 50 }).notNull().unique(),
  isWinner: boolean("isWinner").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RaffleTicket = typeof raffleTickets.$inferSelect;
export type InsertRaffleTicket = typeof raffleTickets.$inferInsert;

/**
 * Raffles - admin-managed raffle campaigns
 */
export const raffles = mysqlTable("raffles", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  triggerProductName: varchar("triggerProductName", { length: 255 }).notNull(), // e.g., "SANDUÍCHE NATURAL"
  startDate: datetime("startDate").notNull(),
  endDate: datetime("endDate").notNull(),
  winnerCount: int("winnerCount").default(1).notNull(),
  prize: text("prize"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Raffle = typeof raffles.$inferSelect;
export type InsertRaffle = typeof raffles.$inferInsert;

/**
 * Promotional campaigns - for hero slider
 */
export const promotions = mysqlTable("promotions", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: text("imageUrl").notNull(),
  discountType: mysqlEnum("discountType", ["percentage", "fixed"]).notNull(),
  discountValue: decimal("discountValue", { precision: 10, scale: 2 }).notNull(),
  applicableProductIds: text("applicableProductIds"), // JSON array of product IDs
  startDate: datetime("startDate").notNull(),
  endDate: datetime("endDate").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  displayOrder: int("displayOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Promotion = typeof promotions.$inferSelect;
export type InsertPromotion = typeof promotions.$inferInsert;

/**
 * Expenses - track business costs
 */
export const expenses = mysqlTable("expenses", {
  id: int("id").autoincrement().primaryKey(),
  category: varchar("category", { length: 255 }).notNull(), // e.g., "Rent", "Utilities", "Supplies"
  description: text("description"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  expenseDate: datetime("expenseDate").notNull(),
  createdBy: int("createdBy").notNull(), // Employee ID
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = typeof expenses.$inferInsert;

/**
 * Stock adjustments - track inventory changes
 */
export const stockAdjustments = mysqlTable("stockAdjustments", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  quantityChange: int("quantityChange").notNull(), // Positive or negative
  reason: varchar("reason", { length: 255 }).notNull(), // "order", "adjustment", "damage", etc.
  adjustedBy: int("adjustedBy").notNull(), // Employee ID
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type StockAdjustment = typeof stockAdjustments.$inferSelect;
export type InsertStockAdjustment = typeof stockAdjustments.$inferInsert;
