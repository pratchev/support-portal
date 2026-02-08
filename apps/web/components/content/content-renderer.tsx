'use client';

import { useEffect, useRef, useState } from 'react';
import DOMPurify from 'dompurify';
import ImageLightbox from '../lightbox/image-lightbox';
import '@/styles/components.css';

interface ContentRendererProps {
  html: string;
  className?: string;
}

export default function ContentRenderer({ html, className = '' }: ContentRendererProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  useEffect(() => {
    if (contentRef.current) {
      // Add click handlers to images for lightbox
      const images = contentRef.current.querySelectorAll('img');
      images.forEach((img) => {
        img.addEventListener('click', () => {
          setLightboxImage(img.src);
        });
        img.style.cursor = 'pointer';
      });

      return () => {
        images.forEach((img) => {
          img.replaceWith(img.cloneNode(true));
        });
      };
    }
  }, [html]);

  // Sanitize HTML before rendering
  const sanitizedHtml = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'mark', 'code', 'pre',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'blockquote', 'hr',
      'a', 'img',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'div', 'span',
      'input', // For task lists
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel', // Links
      'src', 'alt', 'width', 'height', // Images
      'class', 'data-type', // General
      'type', 'checked', 'disabled', // Task lists
      'colspan', 'rowspan', // Tables
    ],
    ALLOWED_CLASSES: {
      span: ['hljs-comment', 'hljs-keyword', 'hljs-string', 'hljs-number', 'hljs-function', 'hljs-title', 'hljs-variable', 'mention'],
      code: ['language-javascript', 'language-typescript', 'language-python', 'language-java', 'language-csharp', 'language-cpp', 'language-sql', 'language-html', 'language-xml', 'language-css', 'language-json', 'language-yaml', 'language-bash', 'language-powershell', 'language-markdown'],
    },
  });

  return (
    <>
      <div
        ref={contentRef}
        className={`content-renderer ${className}`}
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
      <ImageLightbox
        isOpen={lightboxImage !== null}
        imageUrl={lightboxImage || ''}
        onClose={() => setLightboxImage(null)}
      />
    </>
  );
}
