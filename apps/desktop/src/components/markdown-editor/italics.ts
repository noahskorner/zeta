import { Decoration } from '@uiw/react-codemirror';
import { replaceMarkdown } from './replace-markdown';
import { DecorationRange } from './decoration-range';

export function italics(
  lineText: string,
  cursorPosition: number,
  from: number
): Array<DecorationRange> {
  const italicPattern = /(\*|_)(.*?)\1/g;
  const matches = [...lineText.matchAll(italicPattern)];
  if (matches.length === 0) return [];

  const decorations: Array<DecorationRange> = [];
  for (const match of matches) {
    if (match.index === undefined) continue;
    if (!match[1]) continue;

    const delimiter = match[1];
    const matchStart = match.index;
    const matchEnd = match.index + match[0].length - 1;
    const charBeforeStart = lineText[matchStart - 1];
    const charAfterStart = lineText[matchStart + 1];
    const charBeforeEnd = lineText[matchEnd - 1];
    const charAfterEnd = lineText[matchEnd + 1];

    // Skip matches that are part of repeated delimiters (e.g. **bold**).
    if (
      charBeforeStart === delimiter ||
      charAfterStart === delimiter ||
      charBeforeEnd === delimiter ||
      charAfterEnd === delimiter
    ) {
      continue;
    }

    const matchFrom = from + match.index;
    const matchTo = matchFrom + match[0].length;
    const isMatchActive = cursorPosition >= matchFrom && cursorPosition <= matchTo;

    decorations.push({
      from: matchFrom,
      to: matchTo,
      decoration: Decoration.mark({
        tagName: 'em',
        class: 'cm-emphasis',
      }),
    });

    // Replace the markers (* or _)
    decorations.push(...replaceMarkdown(matchFrom, match[0], /(\*|_)/g, isMatchActive));
  }

  return decorations;
}
