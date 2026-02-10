'use client';

import { useState } from 'react';
import ContentRenderer from '@/components/content/content-renderer';
import '@/styles/components.css';

export default function PreviewPage() {
  // Example content with various rich features
  const [exampleContent] = useState(`
    <h1>Support Ticket Example</h1>
    <p>This is an example of how rich content is rendered after being saved.</p>
    
    <h2>Issue Description</h2>
    <p>The application is throwing an error when trying to <strong>upload large files</strong>. 
    Here's the error message I'm seeing:</p>
    
    <pre><code class="language-javascript">Error: ENOSPC: no space left on device
  at Object.writeSync (fs.js:568:3)
  at Object.writeFileSync (fs.js:1198:26)
  at uploadFile (/app/upload.js:45:8)</code></pre>
    
    <h3>Steps to Reproduce</h3>
    <ol>
      <li>Navigate to the upload page</li>
      <li>Select a file larger than 100MB</li>
      <li>Click "Upload"</li>
      <li>Observe the error</li>
    </ol>
    
    <h3>Expected Behavior</h3>
    <p>The file should upload successfully or show a user-friendly error message about file size limits.</p>
    
    <h3>Environment</h3>
    <ul>
      <li><strong>OS:</strong> Ubuntu 22.04</li>
      <li><strong>Node.js:</strong> v18.16.0</li>
      <li><strong>Browser:</strong> Chrome 120</li>
    </ul>
    
    <h3>Additional Notes</h3>
    <blockquote>
      <p>This issue started appearing after we deployed version 2.1.0 last week. 
      It seems to be affecting multiple users.</p>
    </blockquote>
    
    <p>I've also noticed that inline code like <code>fs.writeFileSync()</code> works fine in the error handler.</p>
    
    <hr>
    
    <h3>Related Links</h3>
    <p>More information:</p>
    <ul>
      <li><a href="https://nodejs.org/api/fs.html" target="_blank" rel="noopener noreferrer">Node.js File System Documentation</a></li>
      <li><a href="https://github.com/example/issue" target="_blank" rel="noopener noreferrer">Similar issue on GitHub</a></li>
    </ul>
    
    <p><em>Last updated: 2 hours ago</em></p>
  `);

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1>Content Preview Example</h1>
        <p style={{ color: '#718096' }}>
          This page demonstrates how saved rich content is rendered using the ContentRenderer component.
        </p>
      </div>

      <div style={{
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '24px',
        background: 'white'
      }}>
        <ContentRenderer html={exampleContent} />
      </div>

      <div style={{ marginTop: '40px', padding: '20px', background: '#f7fafc', borderRadius: '8px' }}>
        <h3>Features Demonstrated:</h3>
        <ul style={{ lineHeight: '2', color: '#4a5568' }}>
          <li>✅ Multiple heading levels (H1, H2, H3)</li>
          <li>✅ Text formatting (bold, italic, code)</li>
          <li>✅ Code blocks with syntax highlighting (JavaScript, TypeScript)</li>
          <li>✅ Ordered and unordered lists</li>
          <li>✅ Blockquotes</li>
          <li>✅ Horizontal rules</li>
          <li>✅ Links (external, open in new tab)</li>
          <li>✅ HTML sanitization (safe rendering)</li>
          <li>✅ Responsive design</li>
        </ul>
      </div>
    </main>
  );
}
