/**
 * FormattedText - Safe alternative to dangerouslySetInnerHTML
 *
 * Parses simple markdown-like syntax and renders React elements.
 * Avoids XSS vulnerabilities (JS-0440) by not using innerHTML.
 *
 * Supported syntax:
 * - **bold** -> <strong>bold</strong>
 * - *italic* -> <em>italic</em>
 */

import React from 'react';

interface FormattedTextProps {
  children: string;
  className?: string;
  as?: 'span' | 'p' | 'div';
}

type TextPart = {
  type: 'text' | 'bold' | 'italic';
  content: string;
};

/**
 * Parse text with simple markdown-like formatting
 */
function parseFormattedText(text: string): TextPart[] {
  const parts: TextPart[] = [];
  // Pattern matches **bold** or *italic* (bold first to avoid conflict)
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex, match.index),
      });
    }

    const matched = match[0];
    if (matched.startsWith('**') && matched.endsWith('**')) {
      // Bold text
      parts.push({
        type: 'bold',
        content: matched.slice(2, -2),
      });
    } else if (matched.startsWith('*') && matched.endsWith('*')) {
      // Italic text
      parts.push({
        type: 'italic',
        content: matched.slice(1, -1),
      });
    }

    lastIndex = pattern.lastIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.slice(lastIndex),
    });
  }

  return parts;
}

/**
 * FormattedText Component
 *
 * Safely renders text with simple markdown formatting.
 * No XSS risk as it uses React elements instead of innerHTML.
 *
 * @example
 * ```tsx
 * <FormattedText>
 *   Vous avez **50€** d'aides disponibles
 * </FormattedText>
 * // Renders: Vous avez <strong>50€</strong> d'aides disponibles
 * ```
 */
export function FormattedText({
  children,
  className,
  as: Component = 'span',
}: FormattedTextProps) {
  const parts = parseFormattedText(children);

  return (
    <Component className={className}>
      {parts.map((part, index) => {
        switch (part.type) {
          case 'bold':
            return <strong key={index}>{part.content}</strong>;
          case 'italic':
            return <em key={index}>{part.content}</em>;
          default:
            return <React.Fragment key={index}>{part.content}</React.Fragment>;
        }
      })}
    </Component>
  );
}

export default FormattedText;
