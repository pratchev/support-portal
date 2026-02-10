# Quick Start Guide

Get the Support Portal with Rich Content Support running in 5 minutes!

## Prerequisites

Before you begin, make sure you have:
- **Node.js** version 18.0.0 or higher
- **npm** version 9.0.0 or higher
- **PostgreSQL** database (optional for basic testing)

## Installation

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone https://github.com/pratchev/support-portal.git
cd support-portal

# Install all dependencies (this will install for all workspaces)
npm install
```

### 2. Set Up Environment Variables

```bash
# For the API (optional - needed only for production use)
cp apps/api/.env.example apps/api/.env

# Edit apps/api/.env and configure your database
# DATABASE_URL="postgresql://user:password@localhost:5432/support_portal"
```

### 3. Generate Prisma Client (Optional)

If you want to use the database:

```bash
cd apps/api
npx prisma generate
npx prisma migrate dev
cd ../..
```

### 4. Start Development Servers

Open two terminal windows:

**Terminal 1 - Start API Server:**
```bash
cd apps/api
npm run dev
```
API will be running on http://localhost:3001

**Terminal 2 - Start Web Application:**
```bash
cd apps/web
npm run dev
```
Web app will be running on http://localhost:3000

## Usage

### Try the Editor

1. Open http://localhost:3000 in your browser
2. You'll see the ticket creation form with the rich text editor

### Test Features

#### Text Formatting
- Select text and use toolbar buttons
- Try keyboard shortcuts: Ctrl+B (bold), Ctrl+I (italic), Ctrl+U (underline)

#### Paste Screenshots
1. Take a screenshot (PrtScn or Cmd+Shift+4)
2. Click in the editor
3. Press Ctrl+V or Cmd+V
4. Image will upload automatically!

#### Drag & Drop Images
1. Find an image on your computer
2. Drag it into the editor
3. Drop it - done!

#### Code Blocks
1. Click the `{}` button
2. Select language from dropdown
3. Type or paste code
4. Click "Copy" to copy code

#### File Attachments
1. Scroll to "Attachments" section
2. Drag files into the drop zone
3. Or click to open file picker
4. Upload multiple files at once!

### View Rendered Content

Visit http://localhost:3000/preview to see how saved content is rendered with:
- Syntax highlighting
- Formatted text
- Links and tables
- All features in action!

## Project Structure

```
support-portal/
├── apps/
│   ├── api/              # Backend Express.js API
│   │   ├── src/
│   │   │   ├── routes/   # API endpoints
│   │   │   └── index.ts
│   │   └── prisma/       # Database schema
│   │
│   └── web/              # Frontend Next.js app
│       ├── app/          # Pages
│       ├── components/   # React components
│       └── styles/       # CSS styles
│
├── packages/
│   └── shared/           # Shared types and utilities
│
├── README.md             # Main documentation
├── API.md                # API documentation
├── TESTING.md            # Testing guide
└── QUICKSTART.md         # This file!
```

## Common Issues

### Port Already in Use

If port 3000 or 3001 is already in use:

```bash
# Find and kill the process
lsof -ti:3000 | xargs kill -9  # For port 3000
lsof -ti:3001 | xargs kill -9  # For port 3001

# Or use different ports
PORT=3002 npm run dev  # API
PORT=3001 npm run dev  # Web (update API URL in .env)
```

### Image Upload Fails

Make sure the API server is running on port 3001. Check:
```bash
curl http://localhost:3001/health
# Should return: {"status":"ok"}
```

### Uploads Directory Not Found

The uploads directory is created automatically. If you get errors:
```bash
mkdir -p apps/api/uploads
```

### Dependencies Won't Install

Try:
```bash
# Clear npm cache
npm cache clean --force

# Delete all node_modules
rm -rf node_modules apps/*/node_modules packages/*/node_modules

# Reinstall
npm install
```

## Next Steps

### Learn More

- **Full Documentation:** See [README.md](./README.md)
- **API Reference:** See [API.md](./API.md)
- **Testing Guide:** See [TESTING.md](./TESTING.md)

### Customize

1. **Styling:** Edit `apps/web/styles/components.css`
2. **Editor Extensions:** Add more TipTap extensions in `rich-text-editor.tsx`
3. **API Endpoints:** Add new routes in `apps/api/src/routes/`
4. **File Types:** Update `ALLOWED_FILE_TYPES` in `packages/shared/src/types/attachment.ts`

### Deploy

For production deployment:

1. **Build all packages:**
```bash
npm run build
```

2. **Set up PostgreSQL database**
3. **Configure environment variables**
4. **Deploy API and Web separately** (or use a monorepo hosting service)

## Features Checklist

Use this checklist to verify everything works:

- [ ] Text formatting (bold, italic, underline)
- [ ] Headings (H1, H2, H3)
- [ ] Lists (bullet, numbered, task)
- [ ] Code blocks with syntax highlighting
- [ ] Inline code
- [ ] Image paste from clipboard
- [ ] Image drag & drop
- [ ] Image upload button
- [ ] Image lightbox viewer
- [ ] File attachments drag & drop
- [ ] File upload button
- [ ] File download
- [ ] File delete
- [ ] Links (auto-detect and manual)
- [ ] Tables
- [ ] Blockquotes
- [ ] Horizontal rules
- [ ] Dark theme support

## Support

If you run into issues:

1. Check the console for errors (F12 in browser)
2. Check the API logs in Terminal 1
3. See [TESTING.md](./TESTING.md) for troubleshooting
4. Open an issue on GitHub

## Development Tips

### Hot Reload
Both servers support hot reload - just save your files and changes will appear automatically!

### Debugging
- **Web app:** Use browser DevTools (F12)
- **API:** Add `console.log()` statements in `apps/api/src/`

### Testing New Features
1. Create a new branch: `git checkout -b feature/my-feature`
2. Make your changes
3. Test thoroughly
4. Commit and push

## Congratulations! 🎉

You now have a fully functional rich content editor for your support portal!

Try creating a ticket with:
- Code blocks
- Screenshots
- File attachments
- Formatted text
- Tables and lists

Everything you need for professional support tickets is ready to go!
