'use client';

import { useEffect } from 'react';

interface ImageLightboxProps {
  isOpen: boolean;
  imageUrl: string;
  onClose: () => void;
}

export default function ImageLightbox({
  isOpen,
  imageUrl,
  onClose,
}: ImageLightboxProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
        <button className="lightbox-close" onClick={onClose}>
          ✕
        </button>
        <img src={imageUrl} alt="Full size" className="lightbox-image" />
      </div>
    </div>
  );
}
