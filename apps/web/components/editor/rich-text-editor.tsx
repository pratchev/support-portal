'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Underline from '@tiptap/extension-underline';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Color from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import Placeholder from '@tiptap/extension-placeholder';
import Mention from '@tiptap/extension-mention';
import Dropcursor from '@tiptap/extension-dropcursor';
import { lowlight } from 'lowlight';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';
import csharp from 'highlight.js/lib/languages/csharp';
import cpp from 'highlight.js/lib/languages/cpp';
import sql from 'highlight.js/lib/languages/sql';
import xml from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import json from 'highlight.js/lib/languages/json';
import yaml from 'highlight.js/lib/languages/yaml';
import bash from 'highlight.js/lib/languages/bash';
import powershell from 'highlight.js/lib/languages/powershell';
import markdown from 'highlight.js/lib/languages/markdown';
import { useCallback } from 'react';
import { CodeBlockWithCopy } from './extensions/code-block-with-copy';

// Register languages for syntax highlighting
lowlight.register('javascript', javascript);
lowlight.register('typescript', typescript);
lowlight.register('python', python);
lowlight.register('java', java);
lowlight.register('csharp', csharp);
lowlight.register('cpp', cpp);
lowlight.register('sql', sql);
lowlight.register('html', xml);
lowlight.register('xml', xml);
lowlight.register('css', css);
lowlight.register('json', json);
lowlight.register('yaml', yaml);
lowlight.register('bash', bash);
lowlight.register('powershell', powershell);
lowlight.register('markdown', markdown);

interface RichTextEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
  onImageUpload?: (file: File) => Promise<string>;
}

export default function RichTextEditor({
  content = '',
  onChange,
  placeholder = 'Start typing...',
  editable = true,
  onImageUpload,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // Disable default code block to use our custom one
      }),
      CodeBlockWithCopy.configure({
        lowlight,
        defaultLanguage: 'plaintext',
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Underline,
      Subscript,
      Superscript,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Color,
      TextStyle,
      Placeholder.configure({
        placeholder,
      }),
      Mention.configure({
        HTMLAttributes: {
          class: 'mention',
        },
      }),
      Dropcursor,
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  // Handle image paste from clipboard
  const handlePaste = useCallback(
    async (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items || !onImageUpload) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          event.preventDefault();
          const file = item.getAsFile();
          if (file) {
            const url = await onImageUpload(file);
            editor?.chain().focus().setImage({ src: url }).run();
          }
        }
      }
    },
    [editor, onImageUpload]
  );

  // Handle drag and drop
  const handleDrop = useCallback(
    async (event: DragEvent) => {
      const files = event.dataTransfer?.files;
      if (!files || files.length === 0 || !onImageUpload) return;

      const file = files[0];
      if (file.type.startsWith('image/')) {
        event.preventDefault();
        const url = await onImageUpload(file);
        editor?.chain().focus().setImage({ src: url }).run();
      }
    },
    [editor, onImageUpload]
  );

  // Add event listeners
  if (editor && editable) {
    const editorElement = editor.view.dom;
    editorElement.addEventListener('paste', handlePaste as any);
    editorElement.addEventListener('drop', handleDrop as any);
  }

  if (!editor) {
    return null;
  }

  return (
    <div className="rich-text-editor">
      {editable && <EditorToolbar editor={editor} onImageUpload={onImageUpload} />}
      <EditorContent editor={editor} className="editor-content" />
    </div>
  );
}

interface EditorToolbarProps {
  editor: any;
  onImageUpload?: (file: File) => Promise<string>;
}

function EditorToolbar({ editor, onImageUpload }: EditorToolbarProps) {
  const addImage = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (file && onImageUpload) {
        const url = await onImageUpload(file);
        editor.chain().focus().setImage({ src: url }).run();
      }
    };
    input.click();
  };

  const setLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const insertCodeBlock = () => {
    editor.chain().focus().toggleCodeBlock().run();
  };

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  return (
    <div className="editor-toolbar">
      {/* Text Style Group */}
      <div className="toolbar-group">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'is-active' : ''}
          title="Bold (Ctrl+B)"
        >
          <strong>B</strong>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'is-active' : ''}
          title="Italic (Ctrl+I)"
        >
          <em>I</em>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive('underline') ? 'is-active' : ''}
          title="Underline (Ctrl+U)"
        >
          <u>U</u>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive('strike') ? 'is-active' : ''}
          title="Strikethrough (Ctrl+Shift+X)"
        >
          <s>S</s>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={editor.isActive('highlight') ? 'is-active' : ''}
          title="Highlight"
        >
          ⚡
        </button>
      </div>

      {/* Headings Group */}
      <div className="toolbar-group">
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
          title="Heading 1"
        >
          H1
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
          title="Heading 2"
        >
          H2
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
          title="Heading 3"
        >
          H3
        </button>
      </div>

      {/* Lists Group */}
      <div className="toolbar-group">
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'is-active' : ''}
          title="Bullet List"
        >
          •
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'is-active' : ''}
          title="Numbered List"
        >
          1.
        </button>
        <button
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          className={editor.isActive('taskList') ? 'is-active' : ''}
          title="Task List"
        >
          ☐
        </button>
      </div>

      {/* Blocks Group */}
      <div className="toolbar-group">
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? 'is-active' : ''}
          title="Blockquote"
        >
          ""
        </button>
        <button
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Rule"
        >
          —
        </button>
      </div>

      {/* Code Group */}
      <div className="toolbar-group">
        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={editor.isActive('code') ? 'is-active' : ''}
          title="Inline Code"
        >
          &lt;/&gt;
        </button>
        <button
          onClick={insertCodeBlock}
          className={editor.isActive('codeBlock') ? 'is-active' : ''}
          title="Code Block"
        >
          {'{}'}
        </button>
      </div>

      {/* Media Group */}
      <div className="toolbar-group">
        <button onClick={setLink} title="Insert Link">
          🔗
        </button>
        <button onClick={addImage} title="Insert Image">
          📷
        </button>
      </div>

      {/* Insert Group */}
      <div className="toolbar-group">
        <button onClick={insertTable} title="Insert Table">
          📊
        </button>
      </div>
    </div>
  );
}
