# Development Guide

This guide covers everything you need to know to develop the Support Portal application.

## 📋 Prerequisites

### Required Software

1. **Node.js 22+**
   ```bash
   node --version  # Should be 22.0.0 or higher
   ```
   Download from [nodejs.org](https://nodejs.org/)

2. **Docker Desktop**
   - macOS: [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop)
   - Windows: [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop)
   - Linux: [Docker Engine](https://docs.docker.com/engine/install/)

3. **VS Code** (Recommended)
   Download from [code.visualstudio.com](https://code.visualstudio.com/)

### Recommended VS Code Extensions

When you open the project in VS Code, you'll be prompted to install recommended extensions. You can also install them manually:

- **ESLint** - Code quality and linting
- **Prettier** - Code formatting
- **Tailwind CSS IntelliSense** - Tailwind class suggestions
- **Prisma** - Database schema support
- **Docker** - Docker management
- **GitHub Copilot** - AI pair programmer
- **Playwright** - Test runner
- **DotEnv** - .env file syntax highlighting
- **GitLens** - Git supercharged
- **REST Client** - API testing
- **TypeScript** - Enhanced TypeScript support

## 🚀 Getting Started

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/pratchev/support-portal.git
cd support-portal

# Run the automated setup script
./scripts/setup-dev.sh

# Or manually:
npm install
cp .env.example .env
docker compose up -d
npm run db:migrate
npm run db:seed
```

### 2. Configure Environment

Edit `.env` with your configuration:

```env
# Required for local development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/support_portal
REDIS_URL=redis://localhost:6379
NEXTAUTH_SECRET=your-local-dev-secret
NEXTAUTH_URL=http://localhost:3000

# Optional (for full functionality)
AZURE_OPENAI_ENDPOINT=your-endpoint
AZURE_OPENAI_API_KEY=your-key
GOOGLE_CLIENT_ID=your-client-id
# ... etc
```

### 3. Start Development

```bash
# Start all services (frontend + backend)
npm run dev

# Or start individually
npm run dev:web   # Frontend only (port 3000)
npm run dev:api   # Backend only (port 4000)
```

## 🔧 VS Code Configuration

### Debug Configurations

The project includes pre-configured debug setups in `.vscode/launch.json`:

#### 1. Debug Next.js (Frontend)
- Opens Chrome debugger for the Next.js frontend
- Breakpoints work in your VS Code editor
- **Usage**: Press F5 and select "Debug Next.js"

#### 2. Debug API Server (Backend)
- Attaches to the Express.js API server
- Requires API to be started with `npm run dev:api`
- **Usage**: Start API, then F5 and select "Debug API Server"

#### 3. Debug Vitest Tests
- Runs tests in debug mode
- **Usage**: F5 and select "Debug Vitest Tests"

#### 4. Full Stack (Compound)
- Launches both frontend and backend debuggers
- **Usage**: F5 and select "Full Stack"

### Tasks

Access tasks via `Terminal > Run Task...`:

- **dev:web** - Start frontend dev server
- **dev:api** - Start backend dev server
- **dev:all** - Start both servers
- **db:migrate** - Run database migrations
- **db:seed** - Seed database
- **docker:up** - Start Docker services
- **docker:down** - Stop Docker services
- **test** - Run tests
- **lint** - Run linters
- **build** - Build all packages

## 🗄️ Database Management

### Prisma Commands

```bash
# Navigate to API directory
cd apps/api

# Generate Prisma Client (after schema changes)
npx prisma generate

# Create a migration
npx prisma migrate dev --name description_of_change

# Apply migrations (production)
npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Open Prisma Studio (GUI for database)
npx prisma studio

# Seed database with test data
npx prisma db seed
```

### Making Schema Changes

1. Edit `apps/api/prisma/schema.prisma`
2. Run `npx prisma migrate dev --name your_migration_name`
3. Update seed file if needed: `apps/api/prisma/seed.ts`
4. Restart API server

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests for specific package
cd apps/api && npm test
cd apps/web && npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- apps/api/tests/unit/ticketService.test.ts
```

### Writing Tests

Tests are located in `tests/` directories:
- `apps/api/tests/unit/` - Unit tests
- `apps/api/tests/integration/` - Integration tests

Example unit test:
```typescript
import { describe, it, expect } from 'vitest';
import { ticketService } from '@/services/ticketService';

describe('ticketService', () => {
  it('should create a ticket', async () => {
    const ticket = await ticketService.createTicket({
      subject: 'Test',
      description: 'Test description',
    });
    expect(ticket).toBeDefined();
    expect(ticket.subject).toBe('Test');
  });
});
```

## 🎨 Theming

### Using Themes

The app supports light and dark themes:

```typescript
import { useTheme } from 'next-themes';

function Component() {
  const { theme, setTheme } = useTheme();
  
  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      Toggle Theme
    </button>
  );
}
```

### Customizing Themes

Edit CSS variables in:
- `apps/web/styles/themes/light.css`
- `apps/web/styles/themes/dark.css`

See [THEMING.md](THEMING.md) for detailed instructions.

## 📝 Code Style

### ESLint & Prettier

Code is automatically formatted on save if VS Code settings are applied.

```bash
# Manually format
npm run format

# Manually lint
npm run lint

# Fix linting issues
npm run lint -- --fix
```

### Conventions

- **File naming**: kebab-case for files, PascalCase for components
- **Component exports**: Use named exports
- **Types**: Define in shared package when used by both apps
- **API routes**: RESTful naming (`/api/tickets`, `/api/tickets/:id`)
- **Commits**: Use conventional commits (feat:, fix:, docs:, etc.)

## 🤖 GitHub Copilot Prompts

Use these prompts with GitHub Copilot to accelerate development:

### 1. Creating API Endpoints
```
Create a new API endpoint for [feature] following the existing pattern in apps/api/src/routes/
Include route definition, validation middleware, controller logic, and error handling
```

### 2. Creating React Components
```
Generate a React component for [feature] using shadcn/ui and Tailwind CSS following the pattern in apps/web/components/
Include TypeScript types, proper state management, and accessibility attributes
```

### 3. Database Migrations
```
Write a Prisma migration to add [field] to the [Model] table
Include proper field types, relations if needed, and update the seed file
```

### 4. Writing Tests
```
Create a Vitest unit test for [service] following the pattern in apps/api/tests/
Include test cases for success scenarios, error handling, and edge cases
```

### 5. Theme Customization
```
Add a new theme color variable to both light.css and dark.css theme files
Update the Tailwind config to use this variable and create utility classes
```

### 6. Dashboard Widgets
```
Generate a Recharts dashboard widget showing [metric] over time
Include responsive design, tooltips, and both light/dark theme support
```

### 7. Background Jobs
```
Create a BullMQ background job for [task] following the pattern in apps/api/src/jobs/
Include job processor, retry logic, error handling, and progress tracking
```

### 8. Form Validation
```
Write a Zod validation schema for the [endpoint] request body
Include all required fields, optional fields, and custom validation rules
```

### 9. Custom Hooks
```
Create a custom React hook for [feature] following the pattern in apps/web/hooks/
Include proper TypeScript types, error handling, and loading states
```

### 10. AI Integration
```
Add Azure OpenAI integration to analyze [feature] in apps/api/src/services/aiService.ts
Include proper error handling, token management, and result parsing
```

### 11. E2E Tests
```
Generate a Playwright E2E test for the [page/feature]
Include user interactions, assertions, and proper test isolation
```

### 12. Real-time Features
```
Create a Socket.io event handler for real-time [feature] updates
Include both server-side (apps/api/src/websocket/) and client-side implementation
```

### 13. Admin Dashboard Pages
```
Add a new page to the admin dashboard for [feature] with data table and filters
Include server-side pagination, sorting, and export functionality
```

### 14. DevOps Integration
```
Create an API service function to integrate with Azure DevOps REST API for [operation]
Include authentication, error handling, and proper typing
```

### 15. Database Seeding
```
Write a database seed script to populate [model] with sample data
Include realistic data generation and proper relations
```

### 16. Email Templates
```
Create an HTML email template for [notification type] following the pattern in apps/api/src/templates/
Use inline CSS for email client compatibility and include both light theme styling
```

### 17. Notification Triggers
```
Add a new notification trigger for [event] in the notificationService
Check user preferences, queue the email job, and handle errors gracefully
```

## 🐛 Common Issues

### Port Already in Use

```bash
# Find process using port 3000 or 4000
lsof -ti:3000 | xargs kill -9
lsof -ti:4000 | xargs kill -9
```

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# View logs
docker logs support-portal-postgres

# Restart Docker services
docker compose down && docker compose up -d
```

### Node Modules Issues

```bash
# Clean install
rm -rf node_modules package-lock.json
rm -rf apps/*/node_modules apps/*/package-lock.json
rm -rf packages/*/node_modules packages/*/package-lock.json
npm install
```

### Prisma Client Out of Sync

```bash
cd apps/api
npx prisma generate
```

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Documentation](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

## 🆘 Getting Help

- Check existing [GitHub Issues](https://github.com/pratchev/support-portal/issues)
- Create a new issue with detailed information
- Join our community discussions
- Email: support@swyftops.com

---

Happy coding! 🚀
