import { Decoration } from '@uiw/react-codemirror';
import { DecorationRange } from './decoration-range';

export function replaceMarkdown(
  from: number,
  lineText: string,
  pattern: RegExp,
  isActive: boolean
): Array<DecorationRange> {
  let match;
  const decorations: Array<DecorationRange> = [];
  while ((match = pattern.exec(lineText)) !== null) {
    const matchStart = match.index;
    const matchEnd = match.index + match[0].length;

    decorations.push({
      from: from + matchStart,
      to: from + matchEnd,
      decoration: Decoration.mark({
        tagName: 'span',
        class: 'cm-markdown',
        attributes: {
          'data-active': `${isActive}`,
        },
      }),
    });
  }

  return decorations;
}
