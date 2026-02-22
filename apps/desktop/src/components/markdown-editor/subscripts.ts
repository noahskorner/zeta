import { Decoration } from '@uiw/react-codemirror';
import { replaceMarkdown } from './replace-markdown';
import { DecorationRange } from './decoration-range';

export function subscripts(
  lineText: string,
  isActive: boolean,
  from: number
): Array<DecorationRange> {
  const subscriptPattern = /~([^~]+)~/g;
  const matches = [...lineText.matchAll(subscriptPattern)];
  if (matches.length === 0) return [];

  const decorations: Array<DecorationRange> = [];
  for (const match of matches) {
    if (match.index === undefined) continue;

    const matchStart = match.index;
    const matchEnd = match.index + match[0].length - 1;
    const charBeforeStart = lineText[matchStart - 1];
    const charAfterStart = lineText[matchStart + 1];
    const charBeforeEnd = lineText[matchEnd - 1];
    const charAfterEnd = lineText[matchEnd + 1];

    if (
      charBeforeStart === '~' ||
      charAfterStart === '~' ||
      charBeforeEnd === '~' ||
      charAfterEnd === '~'
    ) {
      continue;
    }

    const matchFrom = from + match.index;
    const matchTo = matchFrom + match[0].length;

    decorations.push({
      from: matchFrom,
      to: matchTo,
      decoration: Decoration.mark({
        tagName: 'sub',
        class: 'cm-subscript',
      }),
    });

    decorations.push(...replaceMarkdown(matchFrom, match[0], /~/g, isActive));
  }

  return decorations;
}
