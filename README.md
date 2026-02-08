# Support Portal

Help Desk Ticketing System — AI-enhanced, modern web app with **Rich Content Support**

## 🚀 Features

### Rich Content Support
This project implements comprehensive rich content features for tickets and responses:

#### 📝 Text Formatting
- **Bold**, *Italic*, <u>Underline</u>, ~~Strikethrough~~, ==Highlight==
- Headings (H1, H2, H3)
- Bullet lists, numbered lists, and task lists with checkboxes
- Blockquotes and horizontal rules
- Text color and background color customization
- Subscript and superscript

#### 💻 Code Support
- **Inline code** with monospace font and background
- **Code blocks** with syntax highlighting for 15+ languages:
  - JavaScript, TypeScript, Python, Java, C#, C++
  - SQL, HTML, CSS, JSON, XML, YAML
  - Bash, PowerShell, Markdown
- Copy code button on each code block
- Line numbers in code blocks
- Proper theming for both Light and Dark modes

#### 🖼️ Images & Media
- **Paste screenshots** directly from clipboard (Ctrl+V / Cmd+V)
- **Drag & drop images** into the editor
- **Upload button** for selecting images
- Inline image display with resizing
- Automatic thumbnail generation
- Lightbox viewer for full-size images
- Support for PNG, JPG, JPEG, GIF, WebP, SVG, BMP, TIFF

#### 📎 File Attachments
- Drag & drop file upload zone
- Support for 40+ file types:
  - Documents: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV
  - Archives: ZIP, RAR, 7Z, TAR, GZ
  - Code files: JS, TS, PY, JAVA, CS, CPP, HTML, CSS, JSON, XML, etc.
- File preview cards with thumbnails
- Download and delete functionality
- Progress indicators during upload
- Configurable limits (25MB per file, 20 files max, 100MB total)

#### 🔗 Links
- Auto-detection and conversion of URLs
- Link preview cards (optional) with metadata
- Open in new tab support
- Custom link dialog

#### 📊 Tables
- Insert and edit tables
- Add/remove rows and columns
- Merge cells support
- Alternating row colors
- Responsive design

#### 🎨 Theme Support
- Full Light theme support
- Full Dark theme support
- Automatic theme detection
- Consistent styling across all components

## 🏗️ Architecture

This is a **monorepo** using **Turborepo** with the following structure:

```
support-portal/
├── apps/
│   ├── web/          # Next.js frontend application
│   │   ├── app/      # Next.js App Router pages
│   │   ├── components/
│   │   │   ├── editor/     # Rich text editor
│   │   │   └── upload/     # File upload components
│   │   └── styles/         # CSS styles
│   │
│   └── api/          # Express.js backend API
│       ├── src/
│       │   ├── routes/     # API routes
│       │   └── index.ts    # Server entry point
│       └── prisma/         # Database schema
│
└── packages/
    └── shared/       # Shared types and constants
        └── src/
            └── types/      # TypeScript types
```

## 🛠️ Tech Stack

### Frontend (`apps/web`)
- **Next.js 14** - React framework with App Router
- **TipTap** - Rich text editor with extensive extensions
- **React Dropzone** - File upload with drag & drop
- **Lowlight + Highlight.js** - Syntax highlighting
- **DOMPurify** - HTML sanitization
- **TypeScript** - Type safety

### Backend (`apps/api`)
- **Express.js** - Node.js web framework
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **Multer** - File upload middleware
- **Sharp** - Image processing and thumbnails
- **Open Graph Scraper** - Link preview metadata

### Shared (`packages/shared`)
- TypeScript types and constants
- File validation utilities
- Shared business logic

## 📦 Installation

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL database

### Setup

1. Clone the repository:
```bash
git clone https://github.com/pratchev/support-portal.git
cd support-portal
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# For API
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env and set your DATABASE_URL

# For Web
cp apps/web/.env.example apps/web/.env
# Edit if needed (default is http://localhost:3001)
```

4. Set up the database:
```bash
cd apps/api
npx prisma generate
npx prisma migrate dev
```

5. Start the development servers:
```bash
# From the root directory
npm run dev

# Or start individually:
cd apps/api && npm run dev  # API server on port 3001
cd apps/web && npm run dev  # Web app on port 3000
```

6. Open your browser and navigate to:
   - Web App: http://localhost:3000
   - API: http://localhost:3001

## 🎯 Usage

### Creating Tickets with Rich Content

1. **Text Formatting**: Use the toolbar buttons or keyboard shortcuts
   - Bold: Ctrl+B / Cmd+B
   - Italic: Ctrl+I / Cmd+I
   - Underline: Ctrl+U / Cmd+U

2. **Adding Images**:
   - Take a screenshot and paste directly (Ctrl+V / Cmd+V)
   - Drag and drop an image into the editor
   - Click the 📷 button to select an image

3. **Code Blocks**:
   - Click the `{}` button to insert a code block
   - Select the language from the dropdown
   - Paste or type your code

4. **File Attachments**:
   - Drag and drop files into the attachment zone
   - Click to open file picker
   - View thumbnails and manage attachments

5. **Links**:
   - Paste a URL and it auto-converts to a link
   - Click the 🔗 button to add a custom link

6. **Tables**:
   - Click the 📊 button to insert a table
   - Use table controls to add/remove rows and columns

## 📚 API Endpoints

### Attachments
- `POST /api/attachments/upload` - Upload file(s)
- `POST /api/attachments/upload-image` - Upload image with thumbnail
- `GET /api/attachments/:id/download` - Download attachment
- `GET /api/attachments/:id/thumbnail` - Get image thumbnail
- `DELETE /api/attachments/:id` - Delete attachment

### Links
- `POST /api/links/preview` - Fetch link preview metadata

## 🔒 Security

- File type validation (whitelist approach)
- File size limits enforced
- HTML sanitization with DOMPurify
- Protected file download endpoints
- Input validation on all API endpoints

## 📝 Database Schema

### Attachment Model
```prisma
model Attachment {
  id            String    @id @default(uuid())
  ticketId      String?
  responseId    String?
  fileName      String
  originalName  String
  filePath      String
  fileUrl       String
  thumbnailPath String?
  thumbnailUrl  String?
  fileSize      BigInt
  mimeType      String
  fileType      String
  width         Int?
  height        Int?
  isInline      Boolean   @default(false)
  uploadedBy    String?
  createdAt     DateTime  @default(now())
}
```

## 🤝 Contributing

This project follows a minimal-change philosophy. Please:
1. Make the smallest possible changes to achieve your goal
2. Maintain consistency with existing code style
3. Test your changes thoroughly
4. Update documentation as needed

## 📄 License

MIT

## 🙏 Acknowledgments

- TipTap for the excellent rich text editor
- Highlight.js for syntax highlighting
- Sharp for image processing
- All other open-source contributors
