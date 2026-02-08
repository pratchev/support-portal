'use client';

import RichTextEditor from '@/components/editor/rich-text-editor';
import FileUpload from '@/components/upload/file-upload';
import { useState } from 'react';
import '@/styles/components.css';

export default function Home() {
  const [content, setContent] = useState('');

  const handleImageUpload = async (file: File): Promise<string> => {
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
      return data.fileUrl;
    } catch (error) {
      console.error('Image upload error:', error);
      alert('Failed to upload image');
      return '';
    }
  };

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ marginBottom: '32px' }}>Support Portal - Rich Content Editor</h1>

      <section style={{ marginBottom: '40px' }}>
        <h2>Create Ticket</h2>
        <p style={{ color: '#718096', marginBottom: '16px' }}>
          Use the rich text editor below to create a ticket with formatted content, code blocks,
          images, and more.
        </p>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Title
          </label>
          <input
            type="text"
            placeholder="Enter ticket title..."
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '16px',
            }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Description
          </label>
          <RichTextEditor
            content={content}
            onChange={setContent}
            placeholder="Describe your issue... You can paste screenshots, add code blocks, format text, and more!"
            onImageUpload={handleImageUpload}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Attachments
          </label>
          <FileUpload maxFiles={20} />
        </div>

        <button
          style={{
            padding: '12px 24px',
            background: '#3182ce',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
          }}
        >
          Create Ticket
        </button>
      </section>

      <section style={{ marginTop: '60px' }}>
        <h2>Features Demonstrated</h2>
        <ul style={{ lineHeight: '2', color: '#4a5568' }}>
          <li>✅ Rich text formatting (bold, italic, underline, strikethrough, highlight)</li>
          <li>✅ Headings (H1, H2, H3)</li>
          <li>✅ Lists (bullet, numbered, task lists)</li>
          <li>✅ Blockquotes and horizontal rules</li>
          <li>✅ Code blocks with syntax highlighting (light & dark themes)</li>
          <li>✅ Inline code formatting</li>
          <li>✅ Tables</li>
          <li>✅ Images (paste from clipboard, drag & drop, or upload)</li>
          <li>✅ Links</li>
          <li>✅ File attachments with drag & drop</li>
          <li>✅ File preview cards with thumbnails</li>
          <li>✅ Download and delete attachments</li>
        </ul>
      </section>

      <section style={{ marginTop: '40px', padding: '20px', background: '#f7fafc', borderRadius: '8px' }}>
        <h3>Try These Features:</h3>
        <ol style={{ lineHeight: '2', color: '#4a5568' }}>
          <li>Take a screenshot and paste it into the editor (Ctrl+V / Cmd+V)</li>
          <li>Click the image button (📷) to upload an image</li>
          <li>Click the code block button ({'{}'}) and write some code</li>
          <li>Drag and drop files into the attachment zone</li>
          <li>Use keyboard shortcuts: Ctrl+B (bold), Ctrl+I (italic), Ctrl+U (underline)</li>
          <li>Insert a table using the table button (📊)</li>
        </ol>
      </section>
    </main>
  );
}
