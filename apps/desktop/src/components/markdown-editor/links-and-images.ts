import { Decoration, EditorView, WidgetType } from '@uiw/react-codemirror';
import { DecorationRange } from './decoration-range';

interface ReferenceDefinition {
  from: number;
}

type ReferenceDefinitions = Map<string, ReferenceDefinition>;

class ExternalLinkWidget extends WidgetType {
  constructor(
    private readonly label: string,
    private readonly href: string,
    private readonly title?: string,
  ) {
    super();
  }

  // Render external links as anchors in preview mode.
  toDOM() {
    const anchor = document.createElement('a');
    anchor.className = 'cm-link-preview';
    anchor.href = this.href;
    anchor.textContent = this.label;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';

    if (this.title) {
      anchor.title = this.title;
    }

    anchor.addEventListener('click', (event) => {
      event.preventDefault();
      // Open markdown links via the host shell so they use the system default browser.
      if (window.zetaApi?.openExternalUrl) {
        void window.zetaApi.openExternalUrl(this.href);
        return;
      }

      window.open(this.href, '_blank', 'noopener,noreferrer');
    });

    return anchor;
  }
}

class ReferenceLinkWidget extends WidgetType {
  constructor(
    private readonly label: string,
    private readonly referenceFrom: number,
  ) {
    super();
  }

  // Jump to the markdown reference definition when clicked.
  toDOM(view: EditorView) {
    const anchor = document.createElement('a');
    anchor.className = 'cm-link-preview';
    anchor.href = '#';
    anchor.textContent = this.label;

    anchor.addEventListener('click', (event) => {
      event.preventDefault();
      view.dispatch({
        selection: { anchor: this.referenceFrom },
        scrollIntoView: true,
      });
      view.focus();
    });

    return anchor;
  }
}

class ImageWidget extends WidgetType {
  constructor(
    private readonly alt: string,
    private readonly src: string,
    private readonly title?: string,
  ) {
    super();
  }

  // Render inline images and show alt fallback if loading fails.
  toDOM() {
    const wrapper = document.createElement('span');
    wrapper.className = 'cm-image-wrapper';

    const image = document.createElement('img');
    image.className = 'cm-image-preview';
    image.alt = this.alt;
    image.src = this.src;

    if (this.title) {
      image.title = this.title;
    }

    const fallback = document.createElement('span');
    fallback.className = 'cm-image-fallback';
    fallback.textContent = `⚠ ${this.alt || 'Image unavailable'}`;
    fallback.style.display = 'none';

    const showFallback = () => {
      image.style.display = 'none';
      fallback.style.display = 'inline';
    };

    image.addEventListener('error', showFallback);

    if (!this.src) {
      showFallback();
    }

    wrapper.appendChild(image);
    wrapper.appendChild(fallback);
    return wrapper;
  }
}

function normalizeReferenceLabel(label: string): string {
  return label.trim().replace(/\s+/g, ' ').toLowerCase();
}

function cleanMarkdownUrl(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith('<') && trimmed.endsWith('>')) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
}

function cleanMarkdownTitle(raw?: string): string | undefined {
  if (!raw) {
    return undefined;
  }

  const trimmed = raw.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

function isSafeExternalUrl(href: string): boolean {
  try {
    const parsed = new URL(href);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' || parsed.protocol === 'mailto:';
  } catch {
    return false;
  }
}

function addDecorationIfAvailable(
  decorations: Array<DecorationRange>,
  usedRanges: Array<{ from: number; to: number }>,
  from: number,
  to: number,
  decoration: Decoration,
) {
  const overlaps = usedRanges.some((range) => from < range.to && to > range.from);
  if (overlaps) {
    return;
  }

  usedRanges.push({ from, to });
  decorations.push({
    from,
    to,
    decoration,
  });
}

export function collectReferenceDefinitions(content: string): ReferenceDefinitions {
  const references: ReferenceDefinitions = new Map();
  const referencePattern =
    /^\s{0,3}\[([^\]]+)\]:\s*(<[^>]+>|[^\s]+)(?:\s+(".*?"|'.*?'|\(.*?\)))?\s*$/;

  const lines = content.split('\n');
  let position = 0;
  for (const line of lines) {
    const match = line.match(referencePattern);
    if (match) {
      const label = normalizeReferenceLabel(match[1]);
      if (!references.has(label)) {
        references.set(label, {
          from: position,
        });
      }
    }

    position += line.length + 1;
  }

  return references;
}

export function linksAndImages(
  lineText: string,
  isActive: boolean,
  from: number,
  referenceDefinitions: ReferenceDefinitions,
): Array<DecorationRange> {
  if (isActive) {
    return [];
  }

  const decorations: Array<DecorationRange> = [];
  const usedRanges: Array<{ from: number; to: number }> = [];

  const referenceDefinitionPattern =
    /^\s{0,3}\[([^\]]+)\]:\s*(<[^>]+>|[^\s]+)(?:\s+(".*?"|'.*?'|\(.*?\)))?\s*$/;
  const referenceDefinitionMatch = lineText.match(referenceDefinitionPattern);
  if (referenceDefinitionMatch) {
    const [, , rawHref, rawTitle] = referenceDefinitionMatch;
    const href = cleanMarkdownUrl(rawHref);

    if (isSafeExternalUrl(href)) {
      const hrefStartInMatch = referenceDefinitionMatch[0].indexOf(rawHref);
      const hrefStartInLine = (referenceDefinitionMatch.index ?? 0) + hrefStartInMatch;
      const matchStart = from + hrefStartInLine;
      const matchEnd = matchStart + rawHref.length;

      addDecorationIfAvailable(
        decorations,
        usedRanges,
        matchStart,
        matchEnd,
        Decoration.replace({
          widget: new ExternalLinkWidget(href, href, cleanMarkdownTitle(rawTitle)),
        }),
      );
    }
  }

  const inlineImagePattern =
    /!\[([^\]]*)\]\(\s*(<[^>]+>|[^)\s]+)(?:\s+(".*?"|'.*?'|\(.*?\)))?\s*\)/g;
  let imageMatch: RegExpExecArray | null = null;
  while ((imageMatch = inlineImagePattern.exec(lineText)) !== null) {
    const [fullMatch, altText, rawSrc, rawTitle] = imageMatch;
    const matchStart = from + imageMatch.index;
    const matchEnd = matchStart + fullMatch.length;

    addDecorationIfAvailable(
      decorations,
      usedRanges,
      matchStart,
      matchEnd,
      Decoration.replace({
        widget: new ImageWidget(altText, cleanMarkdownUrl(rawSrc), cleanMarkdownTitle(rawTitle)),
      }),
    );
  }

  const inlineLinkPattern =
    /\[([^\]]+)\]\(\s*(<[^>]+>|[^)\s]+)(?:\s+(".*?"|'.*?'|\(.*?\)))?\s*\)/g;
  let inlineLinkMatch: RegExpExecArray | null = null;
  while ((inlineLinkMatch = inlineLinkPattern.exec(lineText)) !== null) {
    if (inlineLinkMatch.index > 0 && lineText[inlineLinkMatch.index - 1] === '!') {
      continue;
    }

    const [fullMatch, label, rawHref, rawTitle] = inlineLinkMatch;
    const href = cleanMarkdownUrl(rawHref);
    if (!isSafeExternalUrl(href)) {
      continue;
    }

    const matchStart = from + inlineLinkMatch.index;
    const matchEnd = matchStart + fullMatch.length;

    addDecorationIfAvailable(
      decorations,
      usedRanges,
      matchStart,
      matchEnd,
      Decoration.replace({
        widget: new ExternalLinkWidget(label, href, cleanMarkdownTitle(rawTitle)),
      }),
    );
  }

  const autolinkPattern = /<(https?:\/\/[^>\s]+)>/g;
  let autolinkMatch: RegExpExecArray | null = null;
  while ((autolinkMatch = autolinkPattern.exec(lineText)) !== null) {
    const [fullMatch, href] = autolinkMatch;
    if (!isSafeExternalUrl(href)) {
      continue;
    }

    const matchStart = from + autolinkMatch.index;
    const matchEnd = matchStart + fullMatch.length;

    addDecorationIfAvailable(
      decorations,
      usedRanges,
      matchStart,
      matchEnd,
      Decoration.replace({
        widget: new ExternalLinkWidget(href, href),
      }),
    );
  }

  const referenceLinkPattern = /\[([^\]]+)\]\[([^\]]+)\]/g;
  let referenceLinkMatch: RegExpExecArray | null = null;
  while ((referenceLinkMatch = referenceLinkPattern.exec(lineText)) !== null) {
    if (referenceLinkMatch.index > 0 && lineText[referenceLinkMatch.index - 1] === '!') {
      continue;
    }

    const [fullMatch, label, rawReferenceLabel] = referenceLinkMatch;
    const reference = referenceDefinitions.get(normalizeReferenceLabel(rawReferenceLabel));
    if (!reference) {
      continue;
    }

    const matchStart = from + referenceLinkMatch.index;
    const matchEnd = matchStart + fullMatch.length;

    addDecorationIfAvailable(
      decorations,
      usedRanges,
      matchStart,
      matchEnd,
      Decoration.replace({
        widget: new ReferenceLinkWidget(label, reference.from),
      }),
    );
  }

  return decorations;
}
