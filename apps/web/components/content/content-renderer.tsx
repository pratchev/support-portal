'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import DOMPurify from 'dompurify';
import ImageLightbox from '../lightbox/image-lightbox';
import '@/styles/components.css';

interface ContentRendererProps {
  html: string;
  className?: string;
}

const ALLOWED_CLASSES: Record<string, string[]> = {
  span: ['hljs-comment', 'hljs-keyword', 'hljs-string', 'hljs-number', 'hljs-function', 'hljs-title', 'hljs-variable', 'mention'],
  code: ['language-javascript', 'language-typescript', 'language-python', 'language-java', 'language-csharp', 'language-cpp', 'language-sql', 'language-html', 'language-xml', 'language-css', 'language-json', 'language-yaml', 'language-bash', 'language-powershell', 'language-markdown'],
};

const SANITIZE_CONFIG = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'em', 'u', 's', 'mark', 'code', 'pre',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'blockquote', 'hr',
    'a', 'img',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'div', 'span',
    'input',
  ],
  ALLOWED_ATTR: [
    'href', 'target', 'rel',
    'src', 'alt', 'width', 'height',
    'class', 'data-type',
    'type', 'checked', 'disabled',
    'colspan', 'rowspan',
  ],
};

function sanitizeHtml(html: string): string {
  if (typeof window === 'undefined') {
    return '';
  }

  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.hasAttribute('class')) {
      const tagName = node.tagName.toLowerCase();
      const allowed = ALLOWED_CLASSES[tagName];
      if (allowed) {
        const filtered = Array.from(node.classList).filter((c) => allowed.includes(c));
        if (filtered.length > 0) {
          node.setAttribute('class', filtered.join(' '));
        } else {
          node.removeAttribute('class');
        }
      } else {
        node.removeAttribute('class');
      }
    }
  });

  const result = DOMPurify.sanitize(html, SANITIZE_CONFIG);
  DOMPurify.removeHook('afterSanitizeAttributes');
  return result;
}

export default function ContentRenderer({ html, className = '' }: ContentRendererProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!contentRef.current) return;

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
  }, [html, mounted]);

  const sanitizedHtml = useMemo(() => sanitizeHtml(html), [html]);

  if (!mounted) {
    return <div className={`content-renderer ${className}`} />;
  }

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
