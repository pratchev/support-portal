'use client';

import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import { useState } from 'react';
import { CODE_LANGUAGES } from '@support-portal/shared';

export default function CodeBlockComponent({
  node,
  updateAttributes,
  extension,
}: any) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    const code = node.textContent;
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const changeLanguage = (event: React.ChangeEvent<HTMLSelectElement>) => {
    updateAttributes({ language: event.target.value });
  };

  return (
    <NodeViewWrapper className="code-block-wrapper">
      <div className="code-block-header">
        <select
          value={node.attrs.language || 'plaintext'}
          onChange={changeLanguage}
          className="code-language-select"
          contentEditable={false}
        >
          <option value="plaintext">Plain Text</option>
          {CODE_LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>
              {lang.charAt(0).toUpperCase() + lang.slice(1)}
            </option>
          ))}
        </select>
        <button
          onClick={copyToClipboard}
          className="copy-code-button"
          contentEditable={false}
        >
          {copied ? '✓ Copied!' : '📋 Copy'}
        </button>
      </div>
      <pre className="code-block-content">
        <NodeViewContent as="code" />
      </pre>
    </NodeViewWrapper>
  );
}
