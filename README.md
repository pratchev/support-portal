# Support Portal

[![CI](https://github.com/pratchev/support-portal/workflows/CI/badge.svg)](https://github.com/pratchev/support-portal/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/node-%3E%3D22.0.0-brightgreen)](https://nodejs.org)

**Support Portal** is a modern, AI-enhanced help desk ticketing system built with open-source technologies. It provides a comprehensive solution for managing customer support tickets with features like email integration, real-time updates, AI-powered analysis, and an intelligent notification system.

---

## Table of Contents

- [Features](#-implemented-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#-installation)
- [Starting a Local Test Session](#-starting-a-local-test-session)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [API Endpoints](#-api-endpoints)
- [WebSocket Events](#-websocket-events)
- [Background Jobs](#-background-jobs)
- [Security](#-security)
- [Testing](#-testing)
- [Available Scripts](#-available-scripts)
- [Environment Variables](#-environment-variables)
- [Documentation](#-documentation)
- [License](#-license)

---

## ✨ Implemented Features

### Ticket Management

- Create, view, update, and delete support tickets
- Assign tickets to agents (single or multiple)
- Track tickets by status: **New → Open → In Progress → Waiting for Customer → Waiting for Internal → Resolved → Closed**
- Filter and search tickets by status, priority, category, and free-text search
- Pin important tickets for quick access
- Ticket statistics dashboard
- Public ticket tracking via unique tracking token (no login required)
- Ticket categories: Technical, Billing, Feature Request, Bug Report, General, Other
- Priority levels: Low, Medium, High, Urgent

### AI-Powered Analysis

- **Sentiment analysis** — automatically classifies ticket sentiment (Very Negative → Very Positive) using Azure OpenAI GPT-4
- **Automatic summarization** — generates concise 2–3 sentence ticket summaries
- **AI response suggestions** — auto-generates suggested agent replies
- Non-blocking — AI failures do not affect ticket creation
- Full audit trail of AI-generated content

### Rich Text Editor

- TipTap-based WYSIWYG editor with formatting toolbar
- Bold, italic, underline, strikethrough, headings, lists, blockquotes
- Code blocks with syntax highlighting (language-selectable via lowlight)
- Inline image paste and drag-and-drop image upload
- Emoji picker (emoji-mart)
- DOMPurify sanitization for XSS protection

### Email Integration

- **Inbound**: Automatic email ingestion via Microsoft Graph API (polls every 5 minutes)
- **Outbound**: Notification emails via SMTP or Microsoft Graph API
- Emails matched to existing tickets by ticket number in subject line
- Auto-creation of user accounts from email sender addresses
- Configurable HTML email templates with merged fields

### Knowledge Base

- Create, edit, publish, and delete support articles
- Articles support categories and tags
- Full-text search across articles
- Popular articles tracking (view count)
- Agent/admin-only authoring; public read access for published articles

### Real-Time Updates (WebSocket)

- Socket.io-based real-time communication
- Live ticket update notifications pushed to subscribers
- New ticket alerts for agents and admins
- New response notifications
- Per-ticket subscription rooms
- JWT-authenticated WebSocket connections

### Notifications

- Configurable system-wide notification settings (admin)
- Per-user notification preferences (email on new ticket, reply, assignment, status change, SLA breach, daily digest)
- Dual transport: SMTP and Microsoft Graph API
- Template-based email rendering

### Ratings & Feedback

- 5-star customer satisfaction rating per ticket
- Optional written feedback with ratings
- Satisfaction analytics for admins

### Emoji Reactions

- React to responses with emoji
- Unique constraint per user per response per emoji

### File Uploads & Attachments

- Drag-and-drop file upload (react-dropzone)
- Multi-file upload (up to 5 files per request)
- MIME type validation and filename sanitization
- Attachments linked to tickets and responses
- Rate-limited upload endpoint (10 uploads/hour per IP)

### Analytics & Reporting

- Ticket metrics dashboard (volume, status distribution, timing)
- Agent performance reports (admin-only)
- Customer satisfaction reports
- Recharts-based data visualization

### DevOps Integration

- Link tickets to Azure DevOps work items
- Track external work item IDs and URLs

### SLA Policies

- Define SLA rules by priority level
- First response time targets (minutes)
- Resolution time targets (hours)

### Audit Trail

- Complete action logging for all ticket operations
- Captures user, IP address, user agent, entity changes (JSON diff)

### User Management & Authentication

- JWT-based API authentication with bcrypt password hashing
- NextAuth.js integration on the frontend (CredentialsProvider)
- Role-based access control: **User**, **Agent**, **Admin**
- User CRUD (admin-only)
- Agent listing
- User profile management
- Schema supports Microsoft and Google OAuth providers (not yet fully wired)

### Theming & UI

- Light and dark themes with CSS custom properties
- Theme switching via next-themes with persistence
- Tailwind CSS utility-first styling
- Radix UI accessible primitives (dialog, dropdown, select, switch, tabs, tooltip, avatar)
- Responsive design for desktop and mobile
- Lucide React icon library

### Link Previews

- Fetch Open Graph and Twitter Card metadata for pasted URLs
- Display rich link previews in ticket content

---

## 🏗️ Architecture

Support Portal is a **Turborepo monorepo** with three packages:

```
┌───────────────────────────────────────────────────────────────────────┐
│                          Support Portal                               │
├───────────────────────┬────────────────────┬──────────────────────────┤
│    Frontend (Web)     │   Backend (API)    │    Shared Package        │
│    Next.js 15         │   Express.js       │    TypeScript types      │
│    React 19           │   TypeScript       │    Shared constants      │
│    TypeScript         │   Prisma ORM       │    (statuses, priorities,│
│    Tailwind CSS       │   Socket.io        │     categories)          │
│    Radix UI / shadcn  │   BullMQ workers   │                          │
│    TipTap Editor      │   Zod validation   │                          │
│    Socket.io Client   │   Winston logging  │                          │
│    NextAuth.js        │   JWT auth         │                          │
│    Recharts           │   Multer uploads   │                          │
└───────────────────────┴────────────────────┴──────────────────────────┘
         │                       │
         │   HTTP / WebSocket    │
         ├───────────────────────┤
         │                       │
    ┌────┴────┐           ┌──────┴──────┐
    │ Browser │           │  PostgreSQL │  ← Prisma ORM
    └─────────┘           │  (port 5432)│
                          └─────────────┘
                          ┌─────────────┐
                          │    Redis    │  ← BullMQ job queues
                          │  (port 6379)│     + rate limiting
                          └─────────────┘
                          ┌─────────────────────────────┐
                          │     External Services        │
                          │  • Azure OpenAI (GPT-4)      │
                          │  • Microsoft Graph API       │
                          │  • Azure DevOps REST API     │
                          │  • SMTP email servers         │
                          └─────────────────────────────┘
```

### Data Flow

1. **Users** interact with the **Next.js frontend** (port 3000)
2. The frontend calls the **Express API** (port 3001) via REST and subscribes to **Socket.io** for real-time updates
3. The API uses **Prisma ORM** to query **PostgreSQL** and **BullMQ** to enqueue asynchronous jobs on **Redis**
4. **Background workers** process AI analysis, email ingestion, and notification delivery
5. WebSocket events are pushed back to the frontend for live updates

---

## 🛠️ Tech Stack

| Layer             | Technology                                 | Version            |
| ----------------- | ------------------------------------------ | ------------------ |
| **Monorepo**      | Turborepo                                  | 2.0                |
| **Frontend**      | Next.js, React, TypeScript                 | 15.x, 19.x, 5.4    |
| **Styling**       | Tailwind CSS, Radix UI, Lucide icons       | 3.4, latest, 0.460 |
| **Rich Text**     | TipTap, lowlight, emoji-mart               | 2.1, 2.9, 5.5      |
| **Backend**       | Express.js, TypeScript                     | 4.18, 5.4          |
| **Database**      | PostgreSQL                                 | 16                 |
| **ORM**           | Prisma                                     | 7.4                |
| **Cache / Queue** | Redis, BullMQ, ioredis                     | 7, 5.3, 5.3        |
| **Real-time**     | Socket.io                                  | 4.6                |
| **Auth**          | NextAuth.js (frontend), JWT + bcrypt (API) | 4.24, 9.0          |
| **AI**            | Azure OpenAI SDK                           | 1.0-beta           |
| **Email**         | Nodemailer, Microsoft Graph Client         | 7.0, 3.0           |
| **Validation**    | Zod                                        | 3.22               |
| **File Upload**   | Multer                                     | 2.0                |
| **Logging**       | Winston, Morgan                            | 3.11, 1.10         |
| **Security**      | Helmet, CORS, rate limiter                 | 7.1, 2.8           |
| **Testing**       | Vitest, Testing Library, jsdom             | 4.0, 14.1, 23      |
| **Build**         | Turborepo, TypeScript, esbuild             | 2.0, 5.4, —        |
| **Container**     | Docker Compose (PostgreSQL 16, Redis 7)    | —                  |

---

## Prerequisites

- **Node.js** 22.0.0 or higher
- **npm** 10.0.0 or higher
- **Docker Desktop** (for PostgreSQL and Redis)
- **VS Code** (recommended — the project includes debug configs, tasks, and extension recommendations)

---

## 🚀 Installation

### Option A: Automated Setup

```bash
git clone https://github.com/pratchev/support-portal.git
cd support-portal
./scripts/setup-dev.sh
```

This script will:

1. Verify Node.js 22+ and Docker are available
2. Run `npm install`
3. Copy `.env.example` → `.env` (if not present)
4. Start PostgreSQL and Redis via Docker Compose
5. Generate the Prisma client and run migrations
6. Seed the database with sample data
7. Build the shared package

### Option B: Manual Setup

```bash
# 1. Clone and install
git clone https://github.com/pratchev/support-portal.git
cd support-portal
npm install

# 2. Configure environment
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
# Edit both .env files with your settings (see Environment Variables below)

# 3. Start infrastructure
docker compose up -d

# 4. Set up the database
cd apps/api
npx prisma generate
npx prisma migrate dev
cd ../..

# 5. Seed sample data
npm run db:seed
```

### One-Line Setup (after clone)

```bash
npm run setup    # installs deps, starts Docker, runs migrations, seeds DB
```

---

## 🧪 Starting a Local Test Session

### 1. Start Docker Services

Make sure Docker Desktop is running, then:

```bash
npm run docker:up
```

This starts:

- **PostgreSQL 16** on `localhost:5432` (user: `postgres`, password: `postgres`, database: `support_portal`)
- **Redis 7** on `localhost:6379`

### 2. Start Development Servers

```bash
# Start both frontend and API together
npm run dev

# Or start them individually in separate terminals:
npm run dev:api    # Express API  → http://localhost:3001
npm run dev:web    # Next.js app  → http://localhost:3000
```

### 3. Access the Application

| Service                    | URL                              |
| -------------------------- | -------------------------------- |
| **Web App**                | http://localhost:3000            |
| **API**                    | http://localhost:3001            |
| **API Health Check**       | http://localhost:3001/api/health |
| **Prisma Studio** (DB GUI) | `npm run db:studio`              |

### 4. Default Seed Data

After running `npm run db:seed`, the database is populated with sample users, tickets, and KB articles. Check `apps/api/prisma/seed.ts` for the seed credentials.

### 5. VS Code Tasks & Debugging

The project includes pre-configured VS Code tasks (accessible via **Terminal → Run Task**):

| Task          | Command                  |
| ------------- | ------------------------ |
| `dev:web`     | Start Next.js frontend   |
| `dev:api`     | Start Express API        |
| `dev:all`     | Start both servers       |
| `db:migrate`  | Run Prisma migrations    |
| `db:seed`     | Seed the database        |
| `docker:up`   | Start PostgreSQL + Redis |
| `docker:down` | Stop Docker services     |
| `test`        | Run all tests            |
| `lint`        | Run ESLint               |
| `build`       | Build all packages       |

Debug configurations are available in `.vscode/launch.json`:

- **Debug Next.js** — Chrome debugger for the frontend
- **Debug API Server** — attach to running Express API
- **Debug Vitest Tests** — run tests in debug mode
- **Full Stack** — launch both frontend and backend debuggers

---

## 📦 Project Structure

```
support-portal/
├── apps/
│   ├── api/                        # Express.js Backend API
│   │   ├── prisma/
│   │   │   ├── schema.prisma       # Database schema (14 models)
│   │   │   ├── seed.ts             # Sample data seeder
│   │   │   └── migrations/         # Prisma migrations
│   │   └── src/
│   │       ├── app.ts              # Express app setup (middleware, routes)
│   │       ├── index.ts            # Server entry point (HTTP + WebSocket)
│   │       ├── config/             # Environment, DB, Redis, CORS config
│   │       ├── routes/             # REST API route handlers
│   │       ├── services/           # Business logic layer
│   │       ├── middleware/         # Auth, validation, rate limiting, uploads, errors
│   │       ├── jobs/               # BullMQ background workers
│   │       ├── websocket/          # Socket.io server setup
│   │       ├── templates/          # HTML email templates
│   │       └── utils/              # Logging utilities
│   │
│   └── web/                        # Next.js 15 Frontend
│       ├── app/
│       │   ├── (auth)/             # Login, register, password reset
│       │   ├── (public)/           # Public ticket submission & tracking
│       │   ├── dashboard/          # Customer ticket dashboard
│       │   ├── agent/              # Agent dashboard & ticket management
│       │   ├── admin/              # Admin settings & analytics
│       │   ├── kb/                 # Knowledge base pages
│       │   ├── preview/            # Email template preview
│       │   └── api/                # NextAuth route handlers
│       ├── components/
│       │   ├── ui/                 # Primitives (button, input, dialog, etc.)
│       │   ├── layout/             # Header, footer, navigation
│       │   ├── tickets/            # Ticket list, detail, creation forms
│       │   ├── editor/             # TipTap rich text editor
│       │   ├── dashboard/          # Dashboard widgets
│       │   ├── notifications/      # Notification UI
│       │   ├── ratings/            # Star rating components
│       │   ├── lightbox/           # Image viewer
│       │   ├── upload/             # File upload dropzone
│       │   └── content/            # Content display & rendering
│       ├── hooks/                  # use-auth, use-tickets, use-theme
│       ├── lib/                    # API client, auth config, utils, constants
│       ├── providers/              # Session & theme providers
│       └── styles/                 # Global CSS, theme definitions
│
├── packages/
│   └── shared/                     # Shared TypeScript package
│       └── src/
│           ├── types/              # User, Ticket, Response, Notification, etc.
│           └── constants/          # Statuses, priorities, categories
│
├── scripts/
│   ├── setup-dev.sh                # Automated dev environment setup
│   └── deploy.sh                   # Production deployment script
│
├── docker-compose.yml              # Dev: PostgreSQL 16 + Redis 7
├── docker-compose.prod.yml         # Prod: with passwords & health checks
├── turbo.json                      # Turborepo pipeline config
├── tsconfig.base.json              # Shared TypeScript config
└── package.json                    # Root workspace config
```

---

## 🗄️ Database Schema

The database uses **Prisma ORM** with **PostgreSQL 16** and contains 14 models:

| Model                        | Purpose                                                                                                     |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `User`                       | Users with email, password (bcrypt), role, auth provider, avatar, active status                             |
| `Ticket`                     | Support tickets with number, tracking token, status, priority, category, sentiment, AI summary, pin, source |
| `TicketAssignment`           | Many-to-many agent assignments to tickets                                                                   |
| `Response`                   | Comments/replies on tickets (supports internal notes & AI-generated flags)                                  |
| `Reaction`                   | Emoji reactions on responses (unique per user per emoji per response)                                       |
| `Rating`                     | 1–5 star satisfaction rating per ticket with optional feedback                                              |
| `Attachment`                 | File attachments linked to tickets and/or responses                                                         |
| `KBArticle`                  | Knowledge base articles with categories, tags, view counts                                                  |
| `DevOpsLink`                 | Links to Azure DevOps work items                                                                            |
| `AuditLog`                   | Full audit trail with action, entity, changes (JSON), IP, user agent                                        |
| `SLAPolicy`                  | SLA rules per priority (first response minutes, resolution hours)                                           |
| `NotificationSettings`       | System-wide email/SMTP/Graph API notification config                                                        |
| `UserNotificationPreference` | Per-user notification opt-in/out preferences                                                                |

### Key Enums

- **UserRole**: `USER` · `AGENT` · `ADMIN`
- **AuthProvider**: `LOCAL` · `MICROSOFT` · `GOOGLE`
- **TicketStatus**: `NEW` · `OPEN` · `IN_PROGRESS` · `WAITING_FOR_CUSTOMER` · `WAITING_FOR_INTERNAL` · `RESOLVED` · `CLOSED`
- **TicketPriority**: `LOW` · `MEDIUM` · `HIGH` · `URGENT`
- **TicketCategory**: `TECHNICAL` · `BILLING` · `FEATURE_REQUEST` · `BUG_REPORT` · `GENERAL` · `OTHER`
- **SentimentScore**: `VERY_NEGATIVE` · `NEGATIVE` · `NEUTRAL` · `POSITIVE` · `VERY_POSITIVE`

---

## 🔌 API Endpoints

Base URL: `http://localhost:3001/api`

### Authentication

| Method | Endpoint         | Description                        | Auth |
| ------ | ---------------- | ---------------------------------- | ---- |
| `POST` | `/auth/login`    | User login (rate limited: 5/15min) | No   |
| `POST` | `/auth/register` | User registration                  | No   |

### Tickets

| Method   | Endpoint         | Description                                                     | Auth |
| -------- | ---------------- | --------------------------------------------------------------- | ---- |
| `GET`    | `/tickets`       | List tickets (filterable by status, priority, category, search) | Yes  |
| `GET`    | `/tickets/stats` | Ticket statistics                                               | Yes  |
| `POST`   | `/tickets`       | Create a new ticket                                             | Yes  |
| `GET`    | `/tickets/:id`   | Get ticket details                                              | Yes  |
| `PATCH`  | `/tickets/:id`   | Update a ticket                                                 | Yes  |
| `DELETE` | `/tickets/:id`   | Delete a ticket                                                 | Yes  |

### Users

| Method  | Endpoint        | Description          | Auth  |
| ------- | --------------- | -------------------- | ----- |
| `GET`   | `/users`        | List all users       | Admin |
| `GET`   | `/users/agents` | List all agents      | Yes   |
| `GET`   | `/users/me`     | Current user profile | Yes   |
| `GET`   | `/users/:id`    | Get user by ID       | Yes   |
| `PATCH` | `/users/:id`    | Update user          | Admin |

### Responses & Reactions

| Method   | Endpoint                   | Description           | Auth |
| -------- | -------------------------- | --------------------- | ---- |
| `POST`   | `/responses/:id/reactions` | Add emoji reaction    | Yes  |
| `DELETE` | `/responses/:id/reactions` | Remove emoji reaction | Yes  |

### Knowledge Base

| Method   | Endpoint      | Description                           | Auth        |
| -------- | ------------- | ------------------------------------- | ----------- |
| `GET`    | `/kb`         | List articles (filterable, paginated) | No          |
| `GET`    | `/kb/search`  | Full-text search articles             | No          |
| `GET`    | `/kb/popular` | Popular articles by view count        | No          |
| `POST`   | `/kb`         | Create article                        | Agent/Admin |
| `GET`    | `/kb/:id`     | Get article details                   | No          |
| `PATCH`  | `/kb/:id`     | Update article                        | Agent/Admin |
| `DELETE` | `/kb/:id`     | Delete article                        | Agent/Admin |

### Ratings

| Method | Endpoint                    | Description                                | Auth |
| ------ | --------------------------- | ------------------------------------------ | ---- |
| `POST` | `/ratings`                  | Create or update a rating (1–5 + feedback) | Yes  |
| `GET`  | `/ratings/ticket/:ticketId` | Get ticket rating                          | Yes  |

### Attachments

| Method | Endpoint           | Description                               | Auth |
| ------ | ------------------ | ----------------------------------------- | ---- |
| `POST` | `/attachments`     | Upload files (max 5, rate limited: 10/hr) | Yes  |
| `GET`  | `/attachments/:id` | Get attachment details                    | Yes  |

### Reports

| Method | Endpoint                     | Description                | Auth        |
| ------ | ---------------------------- | -------------------------- | ----------- |
| `GET`  | `/reports/metrics`           | Ticket metrics             | Agent/Admin |
| `GET`  | `/reports/agent-performance` | Agent performance stats    | Admin       |
| `GET`  | `/reports/satisfaction`      | Customer satisfaction data | Agent/Admin |

### Notifications

| Method | Endpoint                     | Description                          | Auth  |
| ------ | ---------------------------- | ------------------------------------ | ----- |
| `GET`  | `/notifications/settings`    | Get notification settings            | Admin |
| `PUT`  | `/notifications/settings`    | Update notification settings         | Admin |
| `GET`  | `/notifications/preferences` | Get user notification preferences    | Yes   |
| `PUT`  | `/notifications/preferences` | Update user notification preferences | Yes   |

### Links

| Method | Endpoint         | Description                              | Auth |
| ------ | ---------------- | ---------------------------------------- | ---- |
| `POST` | `/links/preview` | Fetch Open Graph / Twitter Card metadata | Yes  |

### Health

| Method | Endpoint  | Description      | Auth |
| ------ | --------- | ---------------- | ---- |
| `GET`  | `/health` | API health check | No   |

---

## 📡 WebSocket Events

WebSocket connections require JWT authentication. The server uses Socket.io.

| Event                | Direction       | Description                                |
| -------------------- | --------------- | ------------------------------------------ |
| `subscribe:ticket`   | Client → Server | Subscribe to a ticket's update room        |
| `unsubscribe:ticket` | Client → Server | Unsubscribe from a ticket room             |
| `ticket:update`      | Server → Client | Ticket was modified (sent to subscribers)  |
| `ticket:new`         | Server → Client | New ticket created (sent to agents/admins) |
| `response:new`       | Server → Client | New response added to a ticket             |
| `notification`       | Server → Client | User-specific notification                 |

**Rooms**: `user:{userId}`, `role:{role}`, `ticket:{ticketId}`

---

## ⚙️ Background Jobs

Asynchronous job processing via **BullMQ** with **Redis**:

| Job                | Queue             | Schedule           | Purpose                                                        | Retries                           |
| ------------------ | ----------------- | ------------------ | -------------------------------------------------------------- | --------------------------------- |
| AI Analysis        | `ai-analysis`     | On ticket creation | Sentiment analysis + summarization via Azure OpenAI            | 2 (5s backoff)                    |
| Email Notification | `email`           | On-demand trigger  | Send templated notification emails (SMTP or Graph API)         | 3 (2s backoff, 10/sec rate limit) |
| Email Ingestion    | `email-ingestion` | Every 5 minutes    | Poll inbox via Microsoft Graph API, create tickets from emails | 3 (3s backoff)                    |

---

## 🔐 Security

| Feature                  | Implementation                                                                     |
| ------------------------ | ---------------------------------------------------------------------------------- |
| **Authentication**       | JWT tokens with bcrypt password hashing                                            |
| **Authorization**        | Role-based access control (User / Agent / Admin)                                   |
| **Rate Limiting**        | Redis-backed per-IP rate limiting (100 req/15min API, 5/15min auth, 10/hr uploads) |
| **Security Headers**     | Helmet (CSP, X-Frame-Options, HSTS, etc.)                                          |
| **CORS**                 | Configurable origin allowlist                                                      |
| **Input Validation**     | Zod schemas on all request bodies, query params, and route params                  |
| **SQL Injection**        | Prisma parameterized queries                                                       |
| **XSS Protection**       | DOMPurify sanitization of HTML content                                             |
| **File Upload Safety**   | MIME type validation, filename sanitization, size limits                           |
| **Audit Logging**        | All actions recorded with user, IP, user-agent, and change diff                    |
| **Response Compression** | gzip via `compression` middleware                                                  |

---

## 🧪 Testing

The project uses **Vitest** for both API and web testing.

```bash
# Run all tests
npm test

# Run tests for a specific package
cd apps/api && npm test
cd apps/web && npm test

# Run in watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage
```

- **API tests**: Node.js environment, located in `apps/api/tests/unit/`
- **Web tests**: jsdom environment with `@testing-library/react`, located in `apps/web/test/`

---

## 📜 Available Scripts

```bash
# Development
npm run dev              # Start all services (Turborepo)
npm run dev:web          # Start Next.js frontend only
npm run dev:api          # Start Express API only

# Database
npm run db:migrate       # Run Prisma migrations
npm run db:seed          # Seed database with sample data
npm run db:studio        # Open Prisma Studio (DB GUI)

# Docker
npm run docker:up        # Start PostgreSQL + Redis containers
npm run docker:down      # Stop Docker containers

# Build & Quality
npm run build            # Build all packages
npm test                 # Run all tests
npm run lint             # Run ESLint across all packages
npm run format           # Format code with Prettier
npm run clean            # Remove all build artifacts and node_modules

# One-Command Setup
npm run setup            # Install → Docker up → Migrate → Seed
```

---

## 🔐 Environment Variables

### API (`apps/api/.env`)

| Variable                  | Default                 | Required       | Description                            |
| ------------------------- | ----------------------- | -------------- | -------------------------------------- |
| `NODE_ENV`                | `development`           | No             | Environment mode                       |
| `PORT`                    | `3001`                  | No             | API server port                        |
| `DATABASE_URL`            | —                       | **Yes**        | PostgreSQL connection string           |
| `REDIS_HOST`              | `localhost`             | No             | Redis hostname                         |
| `REDIS_PORT`              | `6379`                  | No             | Redis port                             |
| `REDIS_PASSWORD`          | —                       | No             | Redis password (prod only)             |
| `JWT_SECRET`              | —                       | **Yes (prod)** | JWT signing secret                     |
| `JWT_EXPIRES_IN`          | `7d`                    | No             | JWT token TTL                          |
| `CORS_ORIGIN`             | `http://localhost:3000` | No             | Allowed CORS origins (comma-separated) |
| `AZURE_OPENAI_ENDPOINT`   | —                       | No             | Azure OpenAI endpoint URL              |
| `AZURE_OPENAI_API_KEY`    | —                       | No             | Azure OpenAI API key                   |
| `AZURE_OPENAI_DEPLOYMENT` | `gpt-4`                 | No             | Azure OpenAI deployment name           |
| `GRAPH_CLIENT_ID`         | —                       | No             | Microsoft Graph app client ID          |
| `GRAPH_CLIENT_SECRET`     | —                       | No             | Microsoft Graph app client secret      |
| `GRAPH_TENANT_ID`         | —                       | No             | Microsoft Graph tenant ID              |
| `SMTP_HOST`               | —                       | No             | SMTP server hostname                   |
| `SMTP_PORT`               | `587`                   | No             | SMTP server port                       |
| `SMTP_SECURE`             | `true`                  | No             | Use TLS for SMTP                       |
| `SMTP_USER`               | —                       | No             | SMTP username                          |
| `SMTP_PASSWORD`           | —                       | No             | SMTP password                          |
| `FROM_EMAIL`              | —                       | No             | Sender email address                   |
| `FROM_NAME`               | `Support Portal`        | No             | Sender display name                    |
| `MAX_FILE_SIZE`           | `10485760` (10 MB)      | No             | Max upload file size in bytes          |
| `UPLOAD_DIR`              | `./uploads`             | No             | File upload directory                  |
| `FRONTEND_URL`            | `http://localhost:3000` | No             | Frontend URL for email links           |

### Web (`apps/web/.env`)

| Variable              | Default                 | Required | Description                   |
| --------------------- | ----------------------- | -------- | ----------------------------- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001` | No       | Backend API URL               |
| `NEXTAUTH_URL`        | `http://localhost:3000` | **Yes**  | NextAuth.js callback URL      |
| `NEXTAUTH_SECRET`     | —                       | **Yes**  | NextAuth.js encryption secret |

---

## 📖 Documentation

| Document                           | Description                                            |
| ---------------------------------- | ------------------------------------------------------ |
| [QUICKSTART.md](QUICKSTART.md)     | 5-minute setup guide                                   |
| [DEVELOPMENT.md](DEVELOPMENT.md)   | Detailed development guide, debugging, Prisma commands |
| [API.md](API.md)                   | API documentation                                      |
| [TESTING.md](TESTING.md)           | Testing guide and conventions                          |
| [THEMING.md](THEMING.md)           | Theme customization (CSS variables, dark mode)         |
| [DEPLOYMENT.md](DEPLOYMENT.md)     | Production deployment to Ubuntu with Nginx + PM2       |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Contribution guidelines                                |
| [SECURITY.md](SECURITY.md)         | Security practices and vulnerability reporting         |

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

**Made with ❤️ by SwyftOps**
