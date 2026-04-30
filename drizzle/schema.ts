import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  numeric,
  boolean,
  serial,
} from "drizzle-orm/pg-core";

// Enums
export const roleEnum = pgEnum("role", ["admin", "clerk", "user"]);
export const orderStatusEnum = pgEnum("order_status", ["pending", "preparing", "ready", "completed", "cancelled"]);
export const paymentMethodEnum = pgEnum("payment_method", ["pix", "cash", "debit", "credit"]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "completed", "failed"]);
export const rewardTypeEnum = pgEnum("reward_type", ["points", "discount", "freeItem"]);
export const triggerTypeEnum = pgEnum("trigger_type", ["purchase_amount", "purchase_count", "points_threshold"]);
export const transactionTypeEnum = pgEnum("transaction_type", ["earn", "redeem"]);
export const discountTypeEnum = pgEnum("discount_type", ["percentage", "fixed"]);

/**
 * Core user table backing auth flow.
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: text("openId").notNull().unique(),
  name: text("name"),
  email: text("email"),
  loginMethod: text("loginMethod"),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Product categories for menu organization
 */
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  iconUrl: text("iconUrl"),
  displayOrder: integer("displayOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

/**
 * Products with pricing, cost, and stock tracking
 */
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  categoryId: integer("categoryId").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("imageUrl"),
  costPrice: numeric("costPrice", { precision: 10, scale: 2 }).notNull(),
  salePrice: numeric("salePrice", { precision: 10, scale: 2 }).notNull(),
  stock: integer("stock").default(0).notNull(),
  lowStockThreshold: integer("lowStockThreshold").default(5).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  displayOrder: integer("displayOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Combos - bundles of multiple products with custom pricing
 */
export const combos = pgTable("combos", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("imageUrl"),
  basePrice: numeric("basePrice", { precision: 10, scale: 2 }).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  displayOrder: integer("displayOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Combo = typeof combos.$inferSelect;
export type InsertCombo = typeof combos.$inferInsert;

/**
 * Combo items - products included in a combo
 */
export const comboItems = pgTable("comboItems", {
  id: serial("id").primaryKey(),
  comboId: integer("comboId").notNull(),
  productId: integer("productId").notNull(),
  quantity: integer("quantity").default(1).notNull(),
  priceAdjustment: numeric("priceAdjustment", { precision: 10, scale: 2 }).default("0").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ComboItem = typeof comboItems.$inferSelect;
export type InsertComboItem = typeof comboItems.$inferInsert;

/**
 * Orders - customer purchases
 */
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerId: integer("customerId"),
  orderNumber: text("orderNumber").notNull().unique(),
  status: orderStatusEnum("status").default("pending").notNull(),
  paymentMethod: paymentMethodEnum("paymentMethod").notNull(),
  paymentStatus: paymentStatusEnum("paymentStatus").default("pending").notNull(),
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
  discount: numeric("discount", { precision: 10, scale: 2 }).default("0").notNull(),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  mercadoPagoPaymentId: text("mercadoPagoPaymentId"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Order items - individual products/combos in an order
 */
export const orderItems = pgTable("orderItems", {
  id: serial("id").primaryKey(),
  orderId: integer("orderId").notNull(),
  productId: integer("productId"),
  comboId: integer("comboId"),
  quantity: integer("quantity").default(1).notNull(),
  unitPrice: numeric("unitPrice", { precision: 10, scale: 2 }).notNull(),
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

/**
 * Customers - registered users with loyalty tracking
 */
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  userId: integer("userId"),
  name: text("name").notNull(),
  email: text("email").unique(),
  phone: text("phone"),
  loyaltyPoints: integer("loyaltyPoints").default(0).notNull(),
  totalSpent: numeric("totalSpent", { precision: 12, scale: 2 }).default("0").notNull(),
  totalOrders: integer("totalOrders").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

/**
 * Loyalty programs - configurable reward campaigns
 */
export const loyaltyPrograms = pgTable("loyaltyPrograms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  rewardType: rewardTypeEnum("rewardType").notNull(),
  triggerType: triggerTypeEnum("triggerType").notNull(),
  triggerValue: integer("triggerValue").default(0).notNull(),
  rewardValue: numeric("rewardValue", { precision: 10, scale: 2 }).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type LoyaltyProgram = typeof loyaltyPrograms.$inferSelect;
export type InsertLoyaltyProgram = typeof loyaltyPrograms.$inferInsert;

/**
 * Customer loyalty transactions - track points and rewards
 */
export const loyaltyTransactions = pgTable("loyaltyTransactions", {
  id: serial("id").primaryKey(),
  customerId: integer("customerId").notNull(),
  loyaltyProgramId: integer("loyaltyProgramId"),
  orderId: integer("orderId"),
  transactionType: transactionTypeEnum("transactionType").notNull(),
  pointsAmount: integer("pointsAmount").notNull(),
  rewardApplied: text("rewardApplied"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LoyaltyTransaction = typeof loyaltyTransactions.$inferSelect;
export type InsertLoyaltyTransaction = typeof loyaltyTransactions.$inferInsert;

/**
 * Raffle tickets - issued for SANDUÍCHE NATURAL purchases
 */
export const raffleTickets = pgTable("raffleTickets", {
  id: serial("id").primaryKey(),
  raffleId: integer("raffleId").notNull(),
  customerId: integer("customerId").notNull(),
  orderId: integer("orderId").notNull(),
  ticketNumber: text("ticketNumber").notNull().unique(),
  isWinner: boolean("isWinner").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RaffleTicket = typeof raffleTickets.$inferSelect;
export type InsertRaffleTicket = typeof raffleTickets.$inferInsert;

/**
 * Raffles - admin-managed raffle campaigns
 */
export const raffles = pgTable("raffles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  triggerProductName: text("triggerProductName").notNull(),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  winnerCount: integer("winnerCount").default(1).notNull(),
  prize: text("prize"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Raffle = typeof raffles.$inferSelect;
export type InsertRaffle = typeof raffles.$inferInsert;

/**
 * Promotional campaigns - for hero slider
 */
export const promotions = pgTable("promotions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("imageUrl").notNull(),
  discountType: discountTypeEnum("discountType").notNull(),
  discountValue: numeric("discountValue", { precision: 10, scale: 2 }).notNull(),
  applicableProductIds: text("applicableProductIds"),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  displayOrder: integer("displayOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Promotion = typeof promotions.$inferSelect;
export type InsertPromotion = typeof promotions.$inferInsert;

/**
 * Expenses - track business costs
 */
export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  description: text("description"),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  expenseDate: timestamp("expenseDate").notNull(),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = typeof expenses.$inferInsert;

/**
 * Stock adjustments - track inventory changes
 */
export const stockAdjustments = pgTable("stockAdjustments", {
  id: serial("id").primaryKey(),
  productId: integer("productId").notNull(),
  quantityChange: integer("quantityChange").notNull(),
  reason: text("reason").notNull(),
  adjustedBy: integer("adjustedBy").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type StockAdjustment = typeof stockAdjustments.$inferSelect;
export type InsertStockAdjustment = typeof stockAdjustments.$inferInsert;
