# Support Portal

[![CI](https://github.com/pratchev/support-portal/workflows/CI/badge.svg)](https://github.com/pratchev/support-portal/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/node-%3E%3D22.0.0-brightgreen)](https://nodejs.org)

**Support Portal** is a modern, AI-enhanced help desk ticketing system built with open-source technologies. It provides a comprehensive solution for managing customer support tickets with features like email integration, real-time updates, AI-powered analysis, and intelligent notification system.

## ✨ Features

- 🎫 **Ticket Management** - Create, track, and resolve support tickets
- 📧 **Email Integration** - Automatic email ingestion via Microsoft Graph API
- 🔔 **Smart Notifications** - Configurable email notifications for users and agents
- 🤖 **AI-Powered** - Sentiment analysis and automatic ticket summarization using Azure OpenAI
- ⚡ **Real-time Updates** - Live ticket updates using Socket.io
- 📊 **Analytics & Reports** - Comprehensive dashboards and reporting
- 🎨 **Modern UI** - Beautiful, responsive interface with light/dark themes
- 🔐 **Multi-auth** - Google OAuth, Microsoft OAuth, and email/password
- 📝 **Rich Text Editor** - TipTap editor with emoji support
- 🔗 **DevOps Integration** - Link tickets to Azure DevOps work items
- 📚 **Knowledge Base** - Create and manage support articles
- ⭐ **Ratings & Feedback** - Collect customer satisfaction scores

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Support Portal                          │
├─────────────────────┬───────────────────┬───────────────────┤
│   Frontend (Web)    │   Backend (API)   │  Shared Package   │
│   Next.js 15        │   Express.js      │   Types &         │
│   React 19          │   TypeScript      │   Constants       │
│   TypeScript        │   Prisma ORM      │                   │
│   Tailwind CSS      │   PostgreSQL      │                   │
│   shadcn/ui         │   Redis/BullMQ    │                   │
│   Socket.io Client  │   Socket.io       │                   │
└─────────────────────┴───────────────────┴───────────────────┘
           │                    │                    │
           ├────────────────────┴────────────────────┤
           │         External Services                │
           │  • Azure OpenAI (GPT-4o)                │
           │  • Microsoft Graph API                   │
           │  • Azure DevOps                          │
           │  • SMTP/Email Services                   │
           └──────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 22 or higher
- Docker Desktop
- VS Code (recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/pratchev/support-portal.git
   cd support-portal
   ```

2. **Run the setup script**
   ```bash
   ./scripts/setup-dev.sh
   ```

3. **Start the development servers**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - API: http://localhost:4000
   - DB Admin: `npm run db:studio`

## 📦 Project Structure

```
support-portal/
├── apps/
│   ├── web/           # Next.js 15 Frontend
│   └── api/           # Express.js Backend API
├── packages/
│   └── shared/        # Shared types and constants
├── scripts/           # Setup and deployment scripts
├── .github/           # GitHub Actions workflows
└── docker-compose.yml # Docker services (PostgreSQL, Redis)
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui |
| **Backend** | Node.js, Express.js, TypeScript, Prisma ORM |
| **Database** | PostgreSQL 16 |
| **Cache/Queue** | Redis, BullMQ |
| **Real-time** | Socket.io |
| **Authentication** | NextAuth.js (Google, Microsoft, Email) |
| **AI** | Azure OpenAI Service (GPT-4o) |
| **Email** | Microsoft Graph API, Nodemailer |
| **DevOps** | Azure DevOps REST API |
| **Testing** | Vitest, Playwright |
| **CI/CD** | GitHub Actions |
| **Monorepo** | npm workspaces, Turborepo |

## 📜 Available Scripts

```bash
# Development
npm run dev              # Start all services
npm run dev:web          # Start Next.js frontend only
npm run dev:api          # Start Express API only

# Database
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed database with sample data
npm run db:studio        # Open Prisma Studio

# Docker
npm run docker:up        # Start Docker services
npm run docker:down      # Stop Docker services

# Build & Test
npm run build            # Build all packages
npm test                 # Run tests
npm run lint             # Run linters
npm run format           # Format code with Prettier

# Complete Setup
npm run setup            # Install deps, start Docker, migrate DB, seed
```

## 🔐 Environment Variables

Copy `.env.example` to `.env` and configure:

- **Database**: PostgreSQL connection string
- **Redis**: Redis connection string
- **Auth**: NextAuth secret, OAuth credentials
- **Azure OpenAI**: Endpoint, API key, deployment name
- **Microsoft Graph**: Client ID, secret, tenant ID for email
- **Email**: SMTP or Graph API settings
- **Azure DevOps**: Organization URL, PAT, project

See [`.env.example`](.env.example) for full list.

## 📖 Documentation

- [DEVELOPMENT.md](DEVELOPMENT.md) - Development guide with GitHub Copilot prompts
- [DEPLOYMENT.md](DEPLOYMENT.md) - Production deployment to Ubuntu
- [THEMING.md](THEMING.md) - Theme customization guide

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ using open-source technologies
- Powered by Azure OpenAI for intelligent features
- UI components from [shadcn/ui](https://ui.shadcn.com)

## 📧 Support

For support, email support@swyftops.com or create an issue in this repository.

---

**Made with ❤️ by SwyftOps**
