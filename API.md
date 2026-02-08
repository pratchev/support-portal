# API Documentation - Rich Content Support

This document describes the API endpoints for rich content features in the Support Portal.

## Base URL

```
http://localhost:3001
```

## Authentication

Currently, the API does not require authentication. In production, you should add authentication middleware to protect these endpoints.

---

## Attachments

### Upload Files

Upload one or multiple files to the server.

**Endpoint:** `POST /api/attachments/upload`

**Content-Type:** `multipart/form-data`

**Request Body:**
- `files`: File[] (array of files, max 20)
- `ticketNumber` (optional): string - Ticket number for organizing uploads
- `userId` (optional): string - User ID of the uploader

**Response:**
```json
{
  "attachments": [
    {
      "id": "uuid",
      "fileName": "abc123.pdf",
      "originalName": "document.pdf",
      "fileUrl": "/uploads/2024/01/TICKET-001/abc123.pdf",
      "fileSize": 1048576,
      "mimeType": "application/pdf",
      "fileType": "document",
      "isInline": false
    }
  ]
}
```

**Example:**
```bash
curl -X POST http://localhost:3001/api/attachments/upload \
  -F "files=@/path/to/file1.pdf" \
  -F "files=@/path/to/file2.docx" \
  -F "ticketNumber=TICKET-001"
```

---

### Upload Image with Thumbnail

Upload an image file and automatically generate a thumbnail.

**Endpoint:** `POST /api/attachments/upload-image`

**Content-Type:** `multipart/form-data`

**Request Body:**
- `image`: File (single image file, max 10MB)
- `isInline`: boolean (string "true" or "false") - Whether image is embedded in content
- `ticketNumber` (optional): string
- `userId` (optional): string

**Response:**
```json
{
  "id": "uuid",
  "fileName": "xyz789.png",
  "originalName": "screenshot.png",
  "fileUrl": "/uploads/2024/01/TICKET-001/xyz789.png",
  "thumbnailUrl": "/uploads/2024/01/TICKET-001/xyz789_thumb.png",
  "fileSize": 524288,
  "mimeType": "image/png",
  "fileType": "image",
  "width": 1920,
  "height": 1080,
  "isInline": true
}
```

**Example:**
```bash
curl -X POST http://localhost:3001/api/attachments/upload-image \
  -F "image=@/path/to/screenshot.png" \
  -F "isInline=true" \
  -F "ticketNumber=TICKET-001"
```

---

### Download Attachment

Download a specific attachment by ID.

**Endpoint:** `GET /api/attachments/:id/download`

**Parameters:**
- `id`: string - Attachment UUID

**Response:**
- Binary file download with appropriate `Content-Disposition` header

**Example:**
```bash
curl http://localhost:3001/api/attachments/abc123-uuid/download \
  -o downloaded-file.pdf
```

---

### Get Image Thumbnail

Retrieve the thumbnail version of an image.

**Endpoint:** `GET /api/attachments/:id/thumbnail`

**Parameters:**
- `id`: string - Attachment UUID

**Response:**
- Binary image file (thumbnail)

**Example:**
```bash
curl http://localhost:3001/api/attachments/xyz789-uuid/thumbnail \
  -o thumbnail.png
```

---

### Delete Attachment

Delete an attachment from the server.

**Endpoint:** `DELETE /api/attachments/:id`

**Parameters:**
- `id`: string - Attachment UUID

**Response:**
```json
{
  "success": true,
  "message": "Attachment deleted"
}
```

**Example:**
```bash
curl -X DELETE http://localhost:3001/api/attachments/abc123-uuid
```

---

## Links

### Get Link Preview

Fetch Open Graph metadata for a URL to create a preview card.

**Endpoint:** `POST /api/links/preview`

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "url": "https://example.com",
  "title": "Example Domain",
  "description": "This domain is for use in illustrative examples in documents.",
  "image": "https://example.com/og-image.jpg",
  "siteName": "Example"
}
```

**Example:**
```bash
curl -X POST http://localhost:3001/api/links/preview \
  -H "Content-Type: application/json" \
  -d '{"url": "https://github.com"}'
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Error message describing what went wrong"
}
```

Common causes:
- No files uploaded
- File type not allowed
- File size exceeds limit
- Invalid URL format

### 404 Not Found
```json
{
  "error": "Attachment not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to upload files"
}
```

---

## File Upload Constraints

### Allowed File Types

**Images:**
- Extensions: `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`, `.svg`, `.bmp`, `.tiff`
- Max size: 10 MB

**Documents:**
- Extensions: `.pdf`, `.doc`, `.docx`, `.xls`, `.xlsx`, `.ppt`, `.pptx`, `.txt`, `.csv`, `.rtf`
- Max size: 25 MB

**Archives:**
- Extensions: `.zip`, `.rar`, `.7z`, `.tar`, `.gz`
- Max size: 25 MB

**Code Files:**
- Extensions: `.js`, `.ts`, `.py`, `.java`, `.cs`, `.cpp`, `.html`, `.css`, `.json`, `.xml`, `.yaml`, `.sql`, `.sh`, `.md`
- Max size: 25 MB

**Other:**
- Extensions: `.log`
- Max size: 25 MB

### Limits

- **Max file size:** 25 MB per file (10 MB for images)
- **Max files per upload:** 20 files
- **Max total attachment size per ticket:** 100 MB

---

## Storage Structure

Files are stored on the server using the following directory structure:

```
uploads/
  └── {year}/
      └── {month}/
          └── {ticketNumber}/
              ├── {uuid}.pdf
              ├── {uuid}_thumb.png
              └── ...
```

Example:
```
uploads/
  └── 2024/
      └── 01/
          └── TICKET-001/
              ├── abc123-uuid.pdf
              ├── xyz789-uuid.png
              └── xyz789-uuid_thumb.png
```

---

## Database Schema

Attachments are stored in the database with the following schema:

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

---

## Security Considerations

1. **File Type Validation:** Only whitelisted file extensions are allowed
2. **File Size Limits:** Enforced both client-side and server-side
3. **Unique Filenames:** UUIDs prevent filename conflicts and path traversal
4. **Storage Isolation:** Files organized by ticket for better access control
5. **HTML Sanitization:** All rendered content is sanitized with DOMPurify
6. **TODO:** Add authentication to protect file access
7. **TODO:** Add virus scanning for uploaded files
8. **TODO:** Implement rate limiting to prevent abuse

---

## Integration Examples

### React Component - Image Upload

```typescript
import { useState } from 'react';

export function ImageUploader() {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    setUploading(true);
    
    const formData = new FormData();
    formData.append('image', file);
    formData.append('isInline', 'true');

    try {
      const response = await fetch('http://localhost:3001/api/attachments/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      console.log('Uploaded:', data);
      return data.fileUrl;
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <input 
      type="file" 
      accept="image/*" 
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) handleUpload(file);
      }}
      disabled={uploading}
    />
  );
}
```

### Node.js - Programmatic Upload

```javascript
const FormData = require('form-data');
const fs = require('fs');
const fetch = require('node-fetch');

async function uploadFile(filePath) {
  const form = new FormData();
  form.append('files', fs.createReadStream(filePath));

  const response = await fetch('http://localhost:3001/api/attachments/upload', {
    method: 'POST',
    body: form,
  });

  const data = await response.json();
  console.log('Upload result:', data);
  return data;
}

uploadFile('./document.pdf');
```

---

## Future Enhancements

Planned improvements:
- [ ] Authentication and authorization
- [ ] Image optimization and compression
- [ ] Video file support with thumbnail generation
- [ ] Direct S3/cloud storage integration
- [ ] Progress tracking for large uploads
- [ ] Batch delete operations
- [ ] Attachment search and filtering
- [ ] Virus scanning integration
- [ ] Rate limiting and abuse prevention
