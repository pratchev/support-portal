# Rich Content Support - Testing Guide

This document outlines how to test all the rich content features implemented in the Support Portal.

## Setup

1. Start the API server:
```bash
cd apps/api
npm install
npm run dev
```

2. Start the web application:
```bash
cd apps/web
npm install
npm run dev
```

3. Open http://localhost:3000 in your browser

## Feature Testing Checklist

### 1. Text Formatting ✅

**Test Steps:**
1. Open the editor
2. Type some text and select it
3. Click toolbar buttons to test:
   - **Bold** (or Ctrl+B)
   - *Italic* (or Ctrl+I)
   - <u>Underline</u> (or Ctrl+U)
   - ~~Strikethrough~~
   - Highlight (yellow background)

**Expected Result:** Text should be formatted correctly with visual indicators in the toolbar showing active formatting.

### 2. Headings ✅

**Test Steps:**
1. Type text
2. Click H1, H2, or H3 buttons

**Expected Result:** Text should be styled as headings with appropriate font sizes.

### 3. Lists ✅

**Test Steps:**
1. Click bullet list button
2. Type items and press Enter for new items
3. Try numbered list
4. Try task list (checkboxes)

**Expected Result:** Lists should be properly formatted and functional.

### 4. Code Blocks with Syntax Highlighting ✅

**Test Steps:**
1. Click the `{}` code block button
2. Type or paste code:
```javascript
function greet(name) {
  return `Hello, ${name}!`;
}
```
3. Select language from dropdown (JavaScript)
4. Click "Copy" button

**Expected Result:**
- Code should have syntax highlighting
- Language selector should work
- Copy button should copy code to clipboard
- Works in both light and dark themes

### 5. Inline Code ✅

**Test Steps:**
1. Type text like: "Use the `console.log()` function"
2. Select the code portion
3. Click the `</>` inline code button

**Expected Result:** Code should have monospace font and background color.

### 6. Image Upload - Clipboard Paste ✅

**Test Steps:**
1. Take a screenshot (PrtScn or Cmd+Shift+4)
2. Click in the editor
3. Paste (Ctrl+V or Cmd+V)

**Expected Result:** Image should upload and appear inline in the editor.

### 7. Image Upload - Drag & Drop ✅

**Test Steps:**
1. Find an image file on your computer
2. Drag it into the editor area
3. Drop it

**Expected Result:** Image should upload and appear inline.

### 8. Image Upload - File Picker ✅

**Test Steps:**
1. Click the 📷 image button
2. Select an image from the file picker
3. Click Open

**Expected Result:** Image should upload and appear inline.

### 9. Image Lightbox ✅

**Test Steps:**
1. Upload an image using any method
2. Click on the image in the editor or rendered content

**Expected Result:** Image should open in a full-screen lightbox. Press Escape or click outside to close.

### 10. File Attachments - Drag & Drop ✅

**Test Steps:**
1. Scroll to the "Attachments" section
2. Drag a file (PDF, DOCX, ZIP, etc.) into the drop zone
3. Drop it

**Expected Result:**
- File should upload with progress indicator
- Preview card should appear with:
  - File icon or thumbnail
  - File name and size
  - Download and Delete buttons

### 11. File Attachments - Click to Upload ✅

**Test Steps:**
1. Click on the attachment drop zone
2. Select multiple files (up to 20)
3. Click Open

**Expected Result:** All files should upload and show preview cards.

### 12. File Download ✅

**Test Steps:**
1. Upload a file
2. Click the "Download" button on the preview card

**Expected Result:** File should download to your computer.

### 13. File Delete ✅

**Test Steps:**
1. Upload a file
2. Click the "Delete" button on the preview card

**Expected Result:** File should be removed from the list and deleted from server.

### 14. Links ✅

**Test Steps:**
1. Type or paste a URL: https://example.com
2. Click the 🔗 link button
3. Enter URL and display text

**Expected Result:**
- URL should auto-convert to a clickable link
- Custom links should work
- Links should open in new tab

### 15. Tables ✅

**Test Steps:**
1. Click the 📊 table button
2. Type in the cells
3. Right-click or use table menu to add/remove rows/columns

**Expected Result:** Table should be properly formatted with borders and alternating row colors.

### 16. Blockquotes ✅

**Test Steps:**
1. Type some text
2. Click the blockquote button ("")

**Expected Result:** Text should have a left border and be styled as a quote.

### 17. Horizontal Rule ✅

**Test Steps:**
1. Click the horizontal rule button (—)

**Expected Result:** A horizontal line should appear.

### 18. Theme Support ✅

**Test Steps:**
1. Change your system theme to dark mode
2. Reload the page
3. Check all components

**Expected Result:**
- All components should use dark theme colors
- Code blocks should use dark syntax highlighting
- Text should be readable
- Borders and backgrounds should be appropriate for dark mode

### 19. HTML Sanitization ✅

**Test Steps:**
1. Try to paste malicious HTML with `<script>` tags
2. View the rendered content using ContentRenderer

**Expected Result:** Scripts and dangerous HTML should be stripped out while safe formatting is preserved.

### 20. File Size Limits ✅

**Test Steps:**
1. Try to upload a file larger than 25MB
2. Try to upload an image larger than 10MB

**Expected Result:** Upload should be rejected with an error message.

### 21. File Type Validation ✅

**Test Steps:**
1. Try to upload an unsupported file type (e.g., .exe)

**Expected Result:** Upload should be rejected with an error message.

### 22. Multiple File Upload ✅

**Test Steps:**
1. Select or drag 10 different files at once
2. Upload them all

**Expected Result:** All files should upload in batch and show progress.

## Keyboard Shortcuts

Test these shortcuts work correctly:
- **Ctrl+B / Cmd+B**: Bold
- **Ctrl+I / Cmd+I**: Italic
- **Ctrl+U / Cmd+U**: Underline
- **Ctrl+V / Cmd+V**: Paste (including images from clipboard)
- **Escape**: Close lightbox

## Browser Testing

Test in multiple browsers:
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari (macOS)

## Performance Testing

1. Upload 20 files (maximum allowed)
2. Add 10 images to the editor
3. Create a large document with code blocks, tables, and images
4. Check page load time and responsiveness

**Expected Result:** Page should remain responsive. Images should load with thumbnails first.

## Security Testing

1. Try XSS attacks via editor content
2. Try path traversal in file uploads
3. Try uploading files with fake extensions
4. Try accessing other users' attachments (if implemented)

**Expected Result:** All attacks should be blocked.

## API Testing

Use tools like Postman or curl to test API endpoints:

### Upload File
```bash
curl -X POST http://localhost:3001/api/attachments/upload \
  -F "files=@/path/to/file.pdf"
```

### Upload Image
```bash
curl -X POST http://localhost:3001/api/attachments/upload-image \
  -F "image=@/path/to/image.png" \
  -F "isInline=true"
```

### Download File
```bash
curl http://localhost:3001/api/attachments/{id}/download
```

### Delete File
```bash
curl -X DELETE http://localhost:3001/api/attachments/{id}
```

### Link Preview
```bash
curl -X POST http://localhost:3001/api/links/preview \
  -H "Content-Type: application/json" \
  -d '{"url": "https://github.com"}'
```

## Known Limitations

1. Line numbers in code blocks - Can be added as future enhancement
2. Email rendering - Not yet implemented but structure is ready
3. Link preview cards - API is ready but UI integration pending
4. Mention notifications - Structure exists but backend logic needed
5. File preview for PDFs - Icon shown instead of actual preview

## Troubleshooting

### Images not uploading
- Check API server is running on port 3001
- Check uploads directory exists and is writable
- Check file size is under 10MB

### Code highlighting not working
- Check highlight.js is properly installed
- Verify language is registered in lowlight
- Check theme CSS is loaded

### Dark theme not working
- Check system theme settings
- Verify CSS media query is correct
- Check browser support for prefers-color-scheme

## Success Criteria

All features should:
✅ Work in light and dark themes
✅ Be responsive on mobile and desktop
✅ Handle errors gracefully
✅ Provide user feedback (loading states, success/error messages)
✅ Be secure (XSS prevention, file validation)
✅ Be performant (fast uploads, smooth editing)
