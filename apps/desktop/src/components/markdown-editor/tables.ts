import { Decoration, Line } from '@uiw/react-codemirror';
import { DecorationRange } from './decoration-range';
import { replaceMarkdown } from './replace-markdown';

export function tables(
  line: Line,
  lineText: string,
  isActive: boolean,
  from: number,
  to: number,
  count: number
): { count: number; decorations: Array<DecorationRange> } {
  const isTableRow = lineText.match(/^\s*\|.*\|?\s*$/);
  const isTableSeparator = lineText.match(/^\s*\|?(?:\s*-+\s*\|)+\s*-+\s*\|?\s*$/);

  if (!isTableRow && !isTableSeparator) {
    return {
      count: 0,
      decorations: [],
    };
  }

  const updatedCount = ++count;
  const decorations: Array<DecorationRange> = [
    ...replaceMarkdown(line.from, lineText, /[|:-]/g, isActive),
  ];

  // Table Separator
  if (isTableSeparator) {
    decorations.push({
      from: from,
      to: to,
      decoration: Decoration.mark({
        class: 'cm-table-separator',
      }),
    });
    // Table Row
  } else {
    decorations.push({
      from: from,
      to: to,
      decoration: Decoration.mark({
        class: 'cm-table-row',
        attributes: {
          'data-row-number': `${updatedCount}`,
        },
      }),
    });

    // Table Cells
    const columns = lineText.split('|').slice(1, -1); // remove empty leading/trailing from split
    const offset = from;
    for (const col of columns) {
      const colStart = offset + lineText.slice(offset - from).indexOf(col);
      const colEnd = colStart + col.length;

      decorations.push({
        from: colStart,
        to: colEnd,
        decoration: Decoration.mark({
          tagName: 'span',
          class: 'cm-table-cell',
        }),
      });
    }
  }

  return { count: updatedCount, decorations: decorations };
}
