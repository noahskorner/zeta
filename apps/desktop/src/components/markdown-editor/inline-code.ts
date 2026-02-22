import { Decoration } from '@uiw/react-codemirror';
import { DecorationRange } from './decoration-range';
import { replaceMarkdown } from './replace-markdown';

export function inlineCode(
  lineText: string,
  isActive: boolean,
  from: number
): Array<DecorationRange> {
  const inlineCodePattern = /`([^`]+)`/g;
  const matches = [...lineText.matchAll(inlineCodePattern)];
  if (matches.length === 0) return [];

  const decorations: Array<DecorationRange> = [];
  for (const match of matches) {
    if (match.index === undefined) continue;

    const matchFrom = from + match.index;
    const matchTo = matchFrom + match[0].length;

    decorations.push({
      from: matchFrom,
      to: matchTo,
      decoration: Decoration.mark({
        tagName: 'code',
        class: 'cm-inline-code',
      }),
    });

    decorations.push(...replaceMarkdown(matchFrom, match[0], /`/g, isActive));
  }

  return decorations;
}
