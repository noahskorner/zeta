import { Decoration } from '@uiw/react-codemirror';
import { replaceMarkdown } from './replace-markdown';
import { DecorationRange } from './decoration-range';

export function blockquotes(
  lineText: string,
  isActive: boolean,
  from: number,
  to: number
): Array<DecorationRange> {
  const isBlockquote = lineText.match(/^>\s+/);
  if (!isBlockquote) return [];

  return [
    {
      from: from,
      to: to,
      decoration: Decoration.mark({
        tagName: 'blockquote',
        class: 'cm-blockquote',
      }),
    },
    ...replaceMarkdown(from, lineText, />+\s+/g, isActive),
  ];
}
