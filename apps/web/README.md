# Support Portal Web Application

Next.js 15 frontend for the Support Portal project.

## Features

- 🎨 Modern UI with Tailwind CSS and shadcn/ui components
- 🌓 Dark mode support with next-themes
- 🔐 Authentication with NextAuth.js
- 📊 Dashboard with analytics and charts
- 🎫 Ticket management system
- 📚 Knowledge base
- 🔔 Notification settings
- ✨ Rich text editor with TipTap
- 📱 Responsive design

## Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm/yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Update .env with your configuration
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Build

```bash
npm run build
npm run start
```

### Testing

```bash
npm run test
npm run test:ui
```

### Type Checking

```bash
npm run type-check
```

## Project Structure

```
apps/web/
├── app/                    # Next.js 15 App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── (public)/          # Public pages (submit, track)
│   ├── dashboard/         # User dashboard
│   ├── agent/             # Agent interface
│   ├── admin/             # Admin panel
│   └── kb/                # Knowledge base
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── layout/           # Layout components
│   ├── tickets/          # Ticket-related components
│   ├── dashboard/        # Dashboard components
│   ├── editor/           # Rich text editor
│   ├── ratings/          # Rating components
│   └── notifications/    # Notification settings
├── lib/                  # Utility functions
├── hooks/                # Custom React hooks
├── providers/            # Context providers
├── styles/               # Global styles and themes
└── public/               # Static assets
```

## Key Components

### Admin Settings

The admin settings page (`/admin/settings`) provides comprehensive notification configuration:

- End user notification preferences
- Agent notification preferences
- Manager notification preferences
- Email provider settings (SMTP/Microsoft Graph)
- SMTP configuration
- Test email functionality

### Notification Settings Form

Reusable form component for both system-wide and user-specific notification preferences with validation and API integration.

## Technologies

- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **Radix UI** - Headless UI primitives
- **NextAuth.js** - Authentication
- **TipTap** - Rich text editor
- **Recharts** - Charts and graphs
- **Zod** - Schema validation
- **Vitest** - Testing framework

## License

MIT
