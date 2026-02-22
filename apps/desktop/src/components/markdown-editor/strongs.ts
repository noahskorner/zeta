import { Decoration } from '@uiw/react-codemirror';
import { replaceMarkdown } from './replace-markdown';
import { DecorationRange } from './decoration-range';

export function strongs(lineText: string, isActive: boolean, from: number): Array<DecorationRange> {
  const boldPattern = /\*\*(.*?)\*\*/g;
  const matches = [...lineText.matchAll(boldPattern)];
  if (matches.length === 0) return [];

  const decorations: Array<DecorationRange> = [];

  for (const match of matches) {
    if (!match.index) continue;

    const matchFrom = from + match.index;
    const matchTo = matchFrom + match[0].length;

    decorations.push({
      from: matchFrom,
      to: matchTo,
      decoration: Decoration.mark({
        tagName: 'strong',
        class: 'cm-strong',
      }),
    });

    // Optionally replace the markdown markers (the **)
    decorations.push(...replaceMarkdown(matchFrom, match[0], /\*\*/g, isActive));
  }

  return decorations;
}
