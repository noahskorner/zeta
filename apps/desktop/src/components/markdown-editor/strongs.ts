import { Decoration } from '@uiw/react-codemirror';
import { replaceMarkdown } from './replace-markdown';
import { DecorationRange } from './decoration-range';

export function strongs(
  lineText: string,
  cursorPosition: number,
  from: number
): Array<DecorationRange> {
  const boldPattern = /\*\*(.*?)\*\*/g;
  const matches = [...lineText.matchAll(boldPattern)];
  if (matches.length === 0) return [];

  const decorations: Array<DecorationRange> = [];

  for (const match of matches) {
    if (match.index === undefined) continue;

    const matchStart = match.index;
    const matchEnd = match.index + match[0].length - 1;
    const charBeforeStart = lineText[matchStart - 1];
    const charAfterEnd = lineText[matchEnd + 1];

    // Skip matches that are part of longer asterisk runs (e.g. ***bold***).
    if (charBeforeStart === '*' || charAfterEnd === '*') {
      continue;
    }

    const matchFrom = from + match.index;
    const matchTo = matchFrom + match[0].length;
    const isMatchActive = cursorPosition >= matchFrom && cursorPosition <= matchTo;

    decorations.push({
      from: matchFrom,
      to: matchTo,
      decoration: Decoration.mark({
        tagName: 'strong',
        class: 'cm-strong',
      }),
    });

    // Optionally replace the markdown markers (the **)
    decorations.push(...replaceMarkdown(matchFrom, match[0], /\*\*/g, isMatchActive));
  }

  return decorations;
}
