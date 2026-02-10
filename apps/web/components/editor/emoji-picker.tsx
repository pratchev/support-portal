'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Smile } from 'lucide-react';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
}

export function EmojiPicker({ onSelect }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const emojis = ['😀', '😊', '😂', '🤔', '😍', '👍', '👎', '✅', '❌', '🎉', '🔥', '💡'];

  return (
    <div className="relative">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Smile className="h-4 w-4" />
      </Button>
      {isOpen && (
        <div className="absolute bottom-full mb-2 p-2 bg-popover border rounded-lg shadow-lg grid grid-cols-6 gap-1">
          {emojis.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => {
                onSelect(emoji);
                setIsOpen(false);
              }}
              className="hover:bg-accent p-2 rounded text-lg"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
