import { Decoration } from '@uiw/react-codemirror';
import { replaceMarkdown } from './replace-markdown';
import { DecorationRange } from './decoration-range';

export function italics(lineText: string, isActive: boolean, from: number): Array<DecorationRange> {
  const italicPattern = /(\*|_)(.*?)\1/g;
  const matches = [...lineText.matchAll(italicPattern)];
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
        tagName: 'em',
        class: 'cm-emphasis',
      }),
    });

    // Replace the markers (* or _)
    decorations.push(...replaceMarkdown(matchFrom, match[0], /(\*|_)/g, isActive));
  }

  return decorations;
}
