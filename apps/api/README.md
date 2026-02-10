# Support Portal API

Express.js backend API for the Support Portal project with comprehensive ticket management, notifications, and integrations.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control (USER, AGENT, ADMIN)
- **Ticket Management**: Full CRUD operations with status tracking, assignments, and priorities
- **Real-time Updates**: WebSocket support for live ticket updates
- **Email Notifications**: Comprehensive notification system with Microsoft Graph API and SMTP support
- **AI Integration**: Azure OpenAI for sentiment analysis and ticket summaries
- **Knowledge Base**: Article management with search and categories
- **DevOps Integration**: Link tickets to external work items
- **Reporting**: Ticket metrics, agent performance, and customer satisfaction
- **File Attachments**: Multi-file upload support
- **Background Jobs**: BullMQ for email ingestion, AI analysis, and notifications
- **Rate Limiting**: Redis-based rate limiting per endpoint
- **Audit Logging**: Track all ticket and user actions

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Cache/Queue**: Redis with BullMQ
- **WebSocket**: Socket.io
- **Email**: Nodemailer + Microsoft Graph API
- **AI**: Azure OpenAI
- **Validation**: Zod
- **Testing**: Vitest
- **Logging**: Winston

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- Redis 6+

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Generate Prisma client:
```bash
npm run db:generate
```

4. Run database migrations:
```bash
npm run db:migrate
```

5. Seed the database (optional):
```bash
npm run db:seed
```

### Development

Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3001/api`

### Testing

Run tests:
```bash
npm test
```

Run specific test suites:
```bash
npm run test:unit
npm run test:integration
```

### Building

Build for production:
```bash
npm run build
```

Start production server:
```bash
npm start
```

## API Documentation

### Authentication

#### POST /api/auth/login
Login with email and password.

#### POST /api/auth/register
Register a new user account.

### Tickets

#### GET /api/tickets
Get all tickets (filtered by user role).

#### POST /api/tickets
Create a new ticket.

#### GET /api/tickets/:id
Get ticket by ID with responses and attachments.

#### PATCH /api/tickets/:id
Update ticket (agents/admins only).

#### POST /api/tickets/:id/assign
Assign ticket to an agent.

#### POST /api/tickets/:id/responses
Add a response to a ticket.

### Notifications (CRITICAL)

#### GET /api/notifications/settings
Get system notification settings (admin only).

#### PUT /api/notifications/settings
Update system notification settings (admin only).

#### GET /api/notifications/preferences
Get current user's notification preferences.

#### PUT /api/notifications/preferences
Update current user's notification preferences.

#### POST /api/notifications/test
Send a test email (admin only).

### Users

#### GET /api/users
Get all users (admin only).

#### GET /api/users/agents
Get all agents.

#### GET /api/users/me
Get current user profile.

### Knowledge Base

#### GET /api/kb
Get all KB articles.

#### POST /api/kb
Create a new KB article (agents/admins only).

#### GET /api/kb/:id
Get article by ID.

#### PATCH /api/kb/:id
Update article (agents/admins only).

### Reports

#### GET /api/reports/metrics
Get ticket metrics.

#### GET /api/reports/agent-performance
Get agent performance statistics (admin only).

#### GET /api/reports/satisfaction
Get customer satisfaction ratings.

### Health Check

#### GET /api/health
Check API health status.

## Email Notification System

The notification system is a critical component that supports:

1. **Multiple Providers**:
   - Microsoft Graph API (primary)
   - SMTP (fallback)

2. **Notification Types**:
   - New ticket created
   - Ticket reply received
   - Ticket assigned to agent
   - SLA breach alerts

3. **User Preferences**:
   - Per-user notification preferences
   - Granular control over notification types
   - Daily digest option

4. **Email Templates**:
   - Professional HTML templates with inline CSS
   - Responsive design for mobile compatibility
   - Consistent branding

## Database Schema

See `prisma/schema.prisma` for the complete data model including:
- Users with role-based access
- Tickets with full lifecycle tracking
- Responses with reactions
- Ratings and feedback
- KB articles
- DevOps links
- Audit logs
- SLA policies
- **Notification settings** (system-wide)
- **User notification preferences** (per-user)

## Background Jobs

- **Email Ingestion**: Polls Microsoft Graph API every 5 minutes for new emails
- **AI Analysis**: Analyzes ticket sentiment and generates summaries
- **Notifications**: Processes email notification queue

## WebSocket Events

- `ticket:update` - Real-time ticket updates
- `ticket:new` - New ticket created
- `response:new` - New response added
- `notification` - User-specific notifications

## Environment Variables

See `.env.example` for all required and optional environment variables.

## Security

- Helmet.js for security headers
- Rate limiting per endpoint
- JWT authentication
- Role-based authorization
- Input validation with Zod
- SQL injection protection (Prisma)

## Logging

Logs are written to:
- Console (colored output in development)
- `logs/combined.log` (all logs)
- `logs/error.log` (errors only)

## License

MIT
