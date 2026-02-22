import { Decoration } from '@uiw/react-codemirror';
import { DecorationRange } from './decoration-range';
import { replaceMarkdown } from './replace-markdown';

export function strikethroughs(
  lineText: string,
  isActive: boolean,
  from: number
): Array<DecorationRange> {
  const strikePattern = /~~([^~]+)~~/g;
  const matches = [...lineText.matchAll(strikePattern)];
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
        tagName: 's',
        class: 'cm-strikethrough',
      }),
    });

    decorations.push(...replaceMarkdown(matchFrom, match[0], /~~/g, isActive));
  }

  return decorations;
}
