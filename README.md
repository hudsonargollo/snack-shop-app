# 🥪 Snack Shop App

Aplicação completa de lanchonete com cardápio digital, checkout integrado ao Mercado Pago, painel administrativo e sistema de fidelidade.

---

## Sumário

- [Visão Geral](#visão-geral)
- [Stack Tecnológica](#stack-tecnológica)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Banco de Dados](#banco-de-dados)
- [API — Rotas do Servidor](#api--rotas-do-servidor)
- [Frontend — Páginas e Funcionalidades](#frontend--páginas-e-funcionalidades)
- [Autenticação e Controle de Acesso](#autenticação-e-controle-de-acesso)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Testes](#testes)

---

## Visão Geral

O **Snack Shop App** é uma plataforma full-stack para gestão de lanchonetes. Ela oferece:

- **Cardápio digital** com categorias, produtos e combos
- **Checkout** com suporte a PIX (Mercado Pago), dinheiro, débito e crédito
- **Painel administrativo** para gerenciar produtos, pedidos, promoções, funcionários, sorteios e fidelidade
- **Programa de fidelidade** configurável com acúmulo e resgate de pontos
- **Sistema de sorteios** vinculado à compra de produtos específicos
- **Analytics** de vendas, lucratividade e despesas

---

## Stack Tecnológica

### Backend

| Tecnologia | Uso |
|---|---|
| **Node.js + Express** | Servidor HTTP |
| **tRPC v11** | API type-safe entre cliente e servidor |
| **Drizzle ORM** | Mapeamento objeto-relacional e migrações |
| **MySQL 2** | Banco de dados relacional |
| **Jose (JWT)** | Autenticação via cookies de sessão assinados |
| **Zod** | Validação de schemas de entrada |
| **Axios** | Chamadas HTTP para a API do Mercado Pago |
| **Nanoid** | Geração de IDs únicos (números de pedido, tickets) |
| **tsx / esbuild** | Execução e build do servidor TypeScript |

### Frontend

| Tecnologia | Uso |
|---|---|
| **React 19** | Interface de usuário |
| **Vite 7** | Bundler e servidor de desenvolvimento |
| **TypeScript** | Tipagem estática |
| **Tailwind CSS v4** | Estilização utilitária |
| **Radix UI** | Componentes acessíveis (dialogs, menus, etc.) |
| **shadcn/ui** | Biblioteca de componentes baseada em Radix |
| **TanStack Query v5** | Cache e sincronização de dados do servidor |
| **tRPC React Query** | Integração tRPC com TanStack Query |
| **React Hook Form + Zod** | Formulários com validação |
| **Wouter** | Roteamento client-side leve |
| **Recharts** | Gráficos e visualizações de dados |
| **Framer Motion** | Animações |
| **Sonner** | Notificações toast |
| **date-fns** | Manipulação de datas |
| **Lucide React** | Ícones |
| **next-themes** | Suporte a tema claro/escuro |

### Ferramentas de Desenvolvimento

| Tecnologia | Uso |
|---|---|
| **Vitest** | Framework de testes |
| **Drizzle Kit** | CLI para geração e execução de migrações |
| **Prettier** | Formatação de código |
| **pnpm** | Gerenciador de pacotes |

---

## Estrutura do Projeto

```
snack-shop-app/
├── client/                  # Aplicação React (frontend)
│   ├── src/
│   │   ├── _core/hooks/     # Hooks de autenticação
│   │   ├── components/      # Componentes reutilizáveis
│   │   │   └── ui/          # Componentes shadcn/ui (53 componentes)
│   │   ├── contexts/        # Contextos React (tema)
│   │   ├── hooks/           # Hooks customizados
│   │   ├── lib/             # Utilitários (tRPC client, helpers)
│   │   └── pages/           # Páginas da aplicação
├── server/                  # Servidor Express + tRPC (backend)
│   ├── _core/               # Infraestrutura central
│   │   ├── context.ts       # Contexto tRPC (req, res, user)
│   │   ├── cookies.ts       # Gerenciamento de cookies de sessão
│   │   ├── env.ts           # Variáveis de ambiente
│   │   ├── trpc.ts          # Definição de procedures (public, protected, admin)
│   │   ├── oauth.ts         # Integração OAuth
│   │   └── index.ts         # Entry point do servidor
│   ├── routers/             # Routers tRPC por domínio
│   │   ├── analytics.ts
│   │   ├── customers.ts
│   │   ├── orders.ts
│   │   ├── payments.ts
│   │   ├── products.ts
│   │   └── raffles.ts
│   ├── db.ts                # Funções de acesso ao banco de dados
│   ├── routers.ts           # Composição do router principal
│   └── storage.ts           # Proxy de armazenamento (S3)
├── drizzle/                 # Schema e migrações do banco
│   ├── schema.ts            # Definição de todas as tabelas
│   ├── relations.ts         # Relações entre tabelas
│   └── meta/                # Snapshots de migração
├── shared/                  # Código compartilhado cliente/servidor
│   ├── types.ts             # Re-exportação de tipos do schema
│   └── const.ts             # Constantes globais
└── drizzle.config.ts        # Configuração do Drizzle Kit
```

---

## Banco de Dados

O banco de dados é MySQL, gerenciado pelo Drizzle ORM. Abaixo estão todas as tabelas e seus campos principais.

### `users`
Tabela central de autenticação com controle de acesso por papel.

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | int PK | Identificador único |
| `openId` | varchar(64) | ID do provedor OAuth (único) |
| `name` | text | Nome do usuário |
| `email` | varchar(320) | E-mail |
| `loginMethod` | varchar(64) | Método de login utilizado |
| `role` | enum | `admin`, `clerk` ou `user` |
| `createdAt` / `updatedAt` / `lastSignedIn` | timestamp | Controle de tempo |

### `categories`
Categorias para organização do cardápio.

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | int PK | Identificador único |
| `name` | varchar(255) | Nome da categoria (único) |
| `description` | text | Descrição |
| `iconUrl` | text | URL do ícone circular |
| `displayOrder` | int | Ordem de exibição |

### `products`
Produtos com rastreamento de preço, custo e estoque.

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | int PK | Identificador único |
| `categoryId` | int FK | Categoria do produto |
| `name` | varchar(255) | Nome do produto |
| `description` | text | Descrição |
| `imageUrl` | text | URL da imagem |
| `costPrice` | decimal(10,2) | Preço de custo |
| `salePrice` | decimal(10,2) | Preço de venda |
| `stock` | int | Quantidade em estoque |
| `lowStockThreshold` | int | Limite para alerta de estoque baixo |
| `isActive` | boolean | Produto ativo no cardápio |
| `displayOrder` | int | Ordem de exibição |

### `combos`
Combos — pacotes de múltiplos produtos com preço customizado.

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | int PK | Identificador único |
| `name` | varchar(255) | Nome do combo |
| `basePrice` | decimal(10,2) | Preço base do combo |
| `isActive` | boolean | Combo ativo |

### `comboItems`
Itens que compõem cada combo.

| Campo | Tipo | Descrição |
|---|---|---|
| `comboId` | int FK | Combo ao qual pertence |
| `productId` | int FK | Produto incluído |
| `quantity` | int | Quantidade do produto no combo |
| `priceAdjustment` | decimal(10,2) | Ajuste de preço individual |

### `orders`
Pedidos dos clientes.

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | int PK | Identificador único |
| `customerId` | int FK | Cliente (opcional) |
| `orderNumber` | varchar(50) | Número único do pedido |
| `status` | enum | `pending`, `preparing`, `ready`, `completed`, `cancelled` |
| `paymentMethod` | enum | `pix`, `cash`, `debit`, `credit` |
| `paymentStatus` | enum | `pending`, `completed`, `failed` |
| `subtotal` / `discount` / `total` | decimal(10,2) | Valores financeiros |
| `mercadoPagoPaymentId` | varchar(255) | ID do pagamento no Mercado Pago |
| `notes` | text | Observações do pedido |

### `orderItems`
Itens individuais de cada pedido.

| Campo | Tipo | Descrição |
|---|---|---|
| `orderId` | int FK | Pedido ao qual pertence |
| `productId` | int FK | Produto (opcional) |
| `comboId` | int FK | Combo (opcional) |
| `quantity` | int | Quantidade |
| `unitPrice` | decimal(10,2) | Preço unitário |
| `subtotal` | decimal(10,2) | Subtotal do item |

### `customers`
Clientes cadastrados com rastreamento de fidelidade.

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | int PK | Identificador único |
| `userId` | int FK | Usuário vinculado (opcional) |
| `name` / `email` / `phone` | varchar | Dados de contato |
| `loyaltyPoints` | int | Pontos de fidelidade acumulados |
| `totalSpent` | decimal(12,2) | Total gasto historicamente |
| `totalOrders` | int | Total de pedidos realizados |

### `loyaltyPrograms`
Campanhas de fidelidade configuráveis.

| Campo | Tipo | Descrição |
|---|---|---|
| `rewardType` | enum | `points`, `discount`, `freeItem` |
| `triggerType` | enum | `purchase_amount`, `purchase_count`, `points_threshold` |
| `triggerValue` | int | Valor de gatilho (ex: 10 compras) |
| `rewardValue` | decimal(10,2) | Valor da recompensa |

### `loyaltyTransactions`
Histórico de transações de pontos de fidelidade.

| Campo | Tipo | Descrição |
|---|---|---|
| `customerId` | int FK | Cliente |
| `transactionType` | enum | `earn` (acúmulo) ou `redeem` (resgate) |
| `pointsAmount` | int | Quantidade de pontos |
| `rewardApplied` | text | Descrição da recompensa aplicada |

### `raffles`
Sorteios gerenciados pelo administrador.

| Campo | Tipo | Descrição |
|---|---|---|
| `triggerProductName` | varchar(255) | Produto que gera o ticket (ex: "SANDUÍCHE NATURAL") |
| `startDate` / `endDate` | datetime | Período do sorteio |
| `winnerCount` | int | Número de ganhadores |
| `prize` | text | Descrição do prêmio |

### `raffleTickets`
Tickets de sorteio emitidos para clientes.

| Campo | Tipo | Descrição |
|---|---|---|
| `raffleId` | int FK | Sorteio ao qual pertence |
| `customerId` | int FK | Cliente |
| `orderId` | int FK | Pedido que gerou o ticket |
| `ticketNumber` | varchar(50) | Número único do ticket |
| `isWinner` | boolean | Indica se é um ticket vencedor |

### `promotions`
Campanhas promocionais para o slider da página inicial.

| Campo | Tipo | Descrição |
|---|---|---|
| `discountType` | enum | `percentage` ou `fixed` |
| `discountValue` | decimal(10,2) | Valor do desconto |
| `applicableProductIds` | text | JSON com IDs dos produtos elegíveis |
| `startDate` / `endDate` | datetime | Período da promoção |

### `expenses`
Registro de despesas do negócio.

| Campo | Tipo | Descrição |
|---|---|---|
| `category` | varchar(255) | Categoria da despesa (ex: Aluguel, Insumos) |
| `amount` | decimal(10,2) | Valor |
| `expenseDate` | datetime | Data da despesa |
| `createdBy` | int FK | Funcionário que registrou |

### `stockAdjustments`
Histórico de ajustes de estoque.

| Campo | Tipo | Descrição |
|---|---|---|
| `productId` | int FK | Produto ajustado |
| `quantityChange` | int | Variação (positiva ou negativa) |
| `reason` | varchar(255) | Motivo (ex: `order`, `adjustment`, `damage`) |
| `adjustedBy` | int FK | Funcionário responsável |

---

## API — Rotas do Servidor

A API é construída com **tRPC**, garantindo tipagem end-to-end. Todas as rotas são acessadas via `/trpc`.

Existem três níveis de acesso:
- **`publicProcedure`** — acessível sem autenticação
- **`protectedProcedure`** — requer usuário autenticado
- **`adminProcedure`** — requer papel `admin`

---

### `products` — Produtos e Cardápio

| Rota | Tipo | Acesso | Descrição |
|---|---|---|---|
| `products.list` | query | público | Lista todos os produtos ativos |
| `products.byCategory` | query | público | Lista produtos por categoria |
| `products.get` | query | público | Detalhes de um produto por ID |
| `products.categories` | query | público | Lista todas as categorias |
| `products.combos` | query | público | Lista todos os combos ativos |
| `products.comboDetails` | query | público | Detalhes de um combo com seus itens |
| `products.promotions` | query | público | Lista promoções ativas |
| `products.lowStock` | query | admin | Lista produtos com estoque abaixo do limite |

---

### `orders` — Pedidos

| Rota | Tipo | Acesso | Descrição |
|---|---|---|---|
| `orders.create` | mutation | público | Cria um novo pedido com itens |
| `orders.get` | query | público | Detalhes de um pedido por ID |
| `orders.getByNumber` | query | público | Detalhes de um pedido pelo número |
| `orders.customerHistory` | query | protegido | Histórico de pedidos de um cliente |
| `orders.updateStatus` | mutation | clerk/admin | Atualiza o status do pedido |
| `orders.updatePaymentStatus` | mutation | clerk/admin | Atualiza o status do pagamento |
| `orders.recent` | query | admin | Lista os pedidos mais recentes |

**Status de pedido:** `pending` → `preparing` → `ready` → `completed` / `cancelled`

**Métodos de pagamento:** `pix`, `cash`, `debit`, `credit`

---

### `payments` — Pagamentos (Mercado Pago)

| Rota | Tipo | Acesso | Descrição |
|---|---|---|---|
| `payments.createPixPayment` | mutation | público | Cria um pagamento PIX via Mercado Pago |
| `payments.pollPaymentStatus` | query | público | Consulta o status de um pagamento |
| `payments.confirmPayment` | mutation | público | Confirma ou marca como falho um pagamento |

O fluxo PIX gera um QR code via API do Mercado Pago e armazena o `paymentId` no pedido para rastreamento.

---

### `customers` — Clientes e Fidelidade

| Rota | Tipo | Acesso | Descrição |
|---|---|---|---|
| `customers.getOrCreate` | mutation | público | Busca ou cria um cliente pelo e-mail |
| `customers.get` | query | público | Detalhes de um cliente por ID |
| `customers.loyaltyPrograms` | query | público | Lista programas de fidelidade ativos |
| `customers.loyaltyProgramDetails` | query | público | Detalhes de um programa de fidelidade |
| `customers.addLoyaltyPoints` | mutation | clerk/admin | Adiciona pontos de fidelidade a um cliente |
| `customers.redeemPoints` | mutation | clerk/admin | Resgata pontos de fidelidade |
| `customers.createLoyaltyProgram` | mutation | admin | Cria um novo programa de fidelidade |

---

### `raffles` — Sorteios

| Rota | Tipo | Acesso | Descrição |
|---|---|---|---|
| `raffles.active` | query | público | Lista sorteios ativos |
| `raffles.byProduct` | query | público | Busca sorteio pelo nome do produto gatilho |
| `raffles.issueTicket` | mutation | protegido | Emite um ticket de sorteio para um cliente |
| `raffles.tickets` | query | admin | Lista todos os tickets de um sorteio |
| `raffles.create` | mutation | admin | Cria um novo sorteio |
| `raffles.drawWinners` | mutation | admin | Realiza o sorteio e marca os vencedores |
| `raffles.update` | mutation | admin | Atualiza o status de um sorteio |

---

### `analytics` — Relatórios e Analytics

| Rota | Tipo | Acesso | Descrição |
|---|---|---|---|
| `analytics.bestSellers` | query | admin | Produtos mais vendidos (com limite configurável) |
| `analytics.mostProfitable` | query | admin | Produtos mais lucrativos |
| `analytics.salesTrends` | query | admin | Tendências de vendas por intervalo de datas |
| `analytics.expenses` | query | admin | Despesas por intervalo de datas |

---

### `auth` — Autenticação

| Rota | Tipo | Acesso | Descrição |
|---|---|---|---|
| `auth.me` | query | público | Retorna o usuário autenticado atual |
| `auth.logout` | mutation | público | Encerra a sessão e limpa o cookie |

---

## Frontend — Páginas e Funcionalidades

### Páginas Públicas

| Rota | Componente | Descrição |
|---|---|---|
| `/` | `Home` | Página inicial com slider de promoções e destaques |
| `/menu` | `Menu` | Cardápio digital com categorias, produtos e combos |
| `/checkout` | `Checkout` | Fluxo de checkout com seleção de pagamento e PIX |
| `/account` | `CustomerAccount` | Conta do cliente, histórico de pedidos e pontos de fidelidade |

### Páginas Administrativas

| Rota | Componente | Descrição |
|---|---|---|
| `/admin` | `AdminDashboard` | Painel principal com analytics, pedidos recentes e alertas |
| `/admin/products` | `AdminProducts` | Gerenciamento de produtos, estoque e ajustes |
| `/admin/combos` | `AdminCombos` | Criação e edição de combos com ajuste de preço ao vivo |
| `/admin/promotions` | `AdminPromotions` | Gerenciamento de campanhas promocionais |
| `/admin/employees` | `AdminEmployees` | Gerenciamento de funcionários e atribuição de papéis |
| `/admin/raffles` | `AdminRaffles` | Gerenciamento de sorteios e realização do sorteio |
| `/admin/loyalty` | `AdminLoyalty` | Criação e gestão de programas de fidelidade |

### Componentes Principais

| Componente | Descrição |
|---|---|
| `DashboardLayout` | Layout base do painel administrativo com navegação lateral |
| `Map` | Componente de mapa integrado (Google Maps) |
| `AIChatBox` | Caixa de chat com IA assistente |
| `LoginDialog` | Dialog de login genérico |
| `ErrorBoundary` | Captura de erros React com fallback de UI |

---

## Autenticação e Controle de Acesso

A autenticação é baseada em **OAuth** com sessão armazenada em cookie HTTP-only assinado com JWT (biblioteca `jose`).

### Papéis de Usuário

| Papel | Permissões |
|---|---|
| `user` | Acesso ao cardápio, checkout e conta pessoal |
| `clerk` | Tudo do `user` + atualizar status de pedidos, gerenciar pontos de fidelidade |
| `admin` | Acesso total — inclui analytics, gerenciamento de produtos, sorteios, funcionários e relatórios |

### Procedures tRPC

- **`publicProcedure`** — sem verificação de autenticação
- **`protectedProcedure`** — lança `UNAUTHORIZED` se não houver sessão
- **`adminProcedure`** — lança `FORBIDDEN` se o papel não for `admin`

---

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Banco de dados
DATABASE_URL=mysql://usuario:senha@host:3306/nome_do_banco

# Autenticação
JWT_SECRET=sua_chave_secreta_jwt
OAUTH_SERVER_URL=https://seu-servidor-oauth.com
OWNER_OPEN_ID=open_id_do_proprietario

# Mercado Pago
MERCADO_PAGO_ACCESS_TOKEN=seu_access_token_mercado_pago

# Aplicação
VITE_APP_ID=id_da_aplicacao
NODE_ENV=development

# API interna (Forge)
BUILT_IN_FORGE_API_URL=url_da_api_forge
BUILT_IN_FORGE_API_KEY=chave_da_api_forge
```

---

## Scripts Disponíveis

```bash
# Desenvolvimento (servidor com hot-reload)
pnpm dev

# Build de produção (frontend + backend)
pnpm build

# Iniciar em produção
pnpm start

# Verificação de tipos TypeScript
pnpm check

# Formatar código com Prettier
pnpm format

# Executar testes
pnpm test

# Gerar e executar migrações do banco de dados
pnpm db:push
```

---

## Testes

O projeto usa **Vitest** como framework de testes. Os arquivos de teste estão localizados em `server/`:

- `server/orders.test.ts` — testes de criação e gerenciamento de pedidos
- `server/auth.logout.test.ts` — testes do fluxo de logout

Para executar os testes:

```bash
pnpm test
```

Para executar uma única vez sem modo watch:

```bash
pnpm vitest run
```

---

## Licença

MIT
