import { Decoration, Line } from '@uiw/react-codemirror';
import { replaceMarkdown } from './replace-markdown';
import { DecorationRange } from './decoration-range';

export function headings(
  line: Line,
  lineText: string,
  isActive: boolean,
  from: number,
  to: number
): Array<DecorationRange> {
  const isHeading = lineText.match(/^(#{1,6})\s+/);
  if (!isHeading) return [];

  const level = isHeading[1].length;
  return [
    {
      from: from,
      to: to,
      decoration: Decoration.mark({
        tagName: `h${level}`,
        class: `cm-heading-${level}`,
      }),
    },
    ...replaceMarkdown(line.from, lineText, /#+\s+/g, isActive),
  ];
}
