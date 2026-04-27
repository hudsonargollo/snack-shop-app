# Snack Shop App - Development TODO

## Phase 1: Database Schema & Core Infrastructure
- [x] Design and implement complete database schema (products, categories, orders, customers, employees, combos, loyalty programs, raffle tickets, expenses)
- [x] Set up Drizzle ORM migrations and execute SQL
- [x] Create database helper functions for all entities

## Phase 2: Backend API Routes
- [x] Product management API (CRUD, stock tracking, cost/price management)
- [x] Category management API
- [x] Order management API (create, update status, list)
- [x] Employee authentication and role-based access control
- [x] Customer authentication and profile management
- [x] Combo creation and management API
- [x] Loyalty program API (create campaigns, track points, apply rewards)
- [x] Raffle ticket system API (issue tickets for SANDUÍCHE NATURAL, manage raffles)
- [x] Mercado Pago integration API (create payment, poll status)
- [x] Expense tracking API
- [x] Analytics and reports API (sales trends, best sellers, profitability)

## Phase 3: Frontend - Digital Menu & Checkout
- [x] Design elegant header with branding
- [x] Build hero slider component for promotional campaigns
- [x] Create category selector with circle icons
- [x] Build product listing grid with quick add-to-cart
- [x] Implement shopping cart UI and logic
- [x] Build checkout flow with payment method selection
- [x] Integrate Mercado Pago PIX payment (QR code display, real-time polling)
- [x] Build cash/debit/credit payment option UI

## Phase 4: Frontend - Order Management
- [x] Build order tracking page for customers
- [x] Create order status display (pending → preparing → ready → completed)
- [x] Implement real-time order status updates

## Phase 5: Frontend - Customer Features
- [x] Build customer account creation and login
- [x] Implement order history page
- [x] Build loyalty program UI (points display, reward tracking)
- [x] Display raffle ticket information for SANDUÍCHE NATURAL purchases

## Phase 6: Frontend - Admin Dashboard
- [x] Build admin authentication and role-based access
- [x] Create product management interface
- [ ] Build category management interface
- [x] Create combo builder interface with live price adjustment
- [x] Build stock management and low-stock alerts
- [ ] Implement expense tracking interface
- [x] Create promotional campaign slider management
- [x] Build employee management interface with role assignment
- [x] Create loyalty program campaign management
- [x] Build raffle management interface
- [x] Implement sales analytics and reports dashboard
- [x] Create best-selling products report
- [x] Create profitability analysis report
- [x] Build order management interface with status updates

## Phase 7: Frontend - Clerk Interface
- [x] Build clerk authentication (via role-based access control)
- [x] Create order entry interface for clerks (via admin dashboard)
- [x] Build order status update interface (via admin dashboard)
- [x] Implement stock adjustment interface (via admin products page)

## Phase 8: Polish & Deployment
- [x] Implement elegant, refined UI design throughout (landing page, premium gradient theme)
- [ ] Add loading states and error handling
- [ ] Implement real-time updates (polling for orders, payment status)
- [ ] Write comprehensive vitest tests for critical features
- [ ] Optimize performance and accessibility
- [ ] Configure Cloudflare Pages deployment
- [ ] Final testing and quality assurance

## Completed Features
(Items will be moved here as they are completed)
