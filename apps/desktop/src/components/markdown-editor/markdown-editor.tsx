'use client';

import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import CodeMirror, {
  Decoration,
  DecorationSet,
  EditorView,
  RangeSetBuilder,
  ViewPlugin,
  ViewUpdate,
} from '@uiw/react-codemirror';
import { vscodeDark, vscodeLight } from '@uiw/codemirror-theme-vscode';
import './markdown-editor.css';
import { markdown } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { DecorationRange } from './decoration-range';
import { headings } from './headings';
import { italics } from './italics';
import { strongs } from './strongs';
import { superscripts } from './superscripts';
import { subscripts } from './subscripts';
import { horizontalRules } from './horizontal-rules';
import { blockquotes } from './blockquotes';
import { inlineCode } from './inline-code';
import { strikethroughs } from './strikethroughs';
import { lists, MarkdownLine } from './lists';
import { collectReferenceDefinitions, linksAndImages } from './links-and-images';
import { tables } from './tables';

const mdExtension = markdown({
  codeLanguages: languages,
});

function getDecorationStartSide(decoration: Decoration): number {
  const sideFromDecoration = (decoration as Decoration & { startSide?: number }).startSide;
  if (typeof sideFromDecoration === 'number') {
    return sideFromDecoration;
  }

  const spec = decoration.spec as { startSide?: number; side?: number };
  if (typeof spec.startSide === 'number') {
    return spec.startSide;
  }
  if (typeof spec.side === 'number') {
    return spec.side;
  }

  return 0;
}

export interface MarkdownEditorProps {
  content: string;
  onContentChange: (content: string) => void;
  height?: string;
  editable?: boolean;
  autoFocus?: boolean;
  onBlur?: () => void;
}

export const MarkdownEditor = ({
  content,
  onContentChange,
  height = 'auto',
  editable = true,
  autoFocus = false,
  onBlur,
}: MarkdownEditorProps) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [value, setValue] = useState(content);
  const editorViewRef = useRef<EditorView | null>(null);

  // Wait for client mount before reading resolved theme-dependent state.
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setValue(content);
  }, [content]);

  // Keep markdown code styling aligned with the current app theme.
  useEffect(() => {
    if (!mounted) {
      return;
    }

    const lightThemeHref =
      'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/vs.min.css';
    const darkThemeHref =
      'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/vs2015.min.css';
    const linkId = 'markdown-editor-code-theme';

    let link = document.getElementById(linkId) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }

    link.href = resolvedTheme === 'dark' ? darkThemeHref : lightThemeHref;
  }, [resolvedTheme, mounted]);

  if (!mounted) {
    return null;
  }

  const onChange = (val: string) => {
    setValue(val);
    onContentChange(val);
  };

  return (
    <CodeMirror
      className="w-full outline-none bg-transparent"
      value={value}
      height={height}
      theme={resolvedTheme === 'dark' ? vscodeDark : vscodeLight}
      extensions={[mdExtension, markdownPlugin, EditorView.lineWrapping]}
      onChange={onChange}
      onCreateEditor={(view) => {
        editorViewRef.current = view;
      }}
      editable={editable}
      autoFocus={autoFocus}
      onBlur={onBlur}
    />
  );
};

const markdownPlugin = ViewPlugin.fromClass(
  class {
    view: EditorView;
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.view = view;
      this.decorations = this.buildDecorations(view);
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged || update.selectionSet) {
        this.decorations = this.buildDecorations(update.view);
      }
    }

    buildDecorations(view: EditorView) {
      const builder = new RangeSetBuilder<Decoration>();
      const referenceDefinitions = collectReferenceDefinitions(view.state.doc.toString());

      const decorations: Array<DecorationRange> = [];
      const lines: Array<MarkdownLine> = [];
      const cursorPosition = view.state.selection.main.head;
      const cursorLine = view.state.doc.lineAt(cursorPosition).number;
      const selection = view.state.selection.main;
      const selectionFrom = Math.min(selection.anchor, selection.head);
      const selectionTo = Math.max(selection.anchor, selection.head);

      // Collect line metadata once so feature renderers can process shared line state.
      for (let lineNumber = 1; lineNumber <= view.state.doc.lines; lineNumber++) {
        const line = view.state.doc.line(lineNumber);
        lines.push({
          number: lineNumber,
          from: line.from,
          to: line.to,
          text: line.text,
        });
      }

      // Render tables first so table rows can bypass other inline formatting.
      const { decorations: tableDecorations, tableLineNumbers } = tables({
        lines,
        selectionFrom,
        selectionTo,
      });
      decorations.push(...tableDecorations);

      for (const line of lines) {
        if (tableLineNumbers.has(line.number)) {
          continue;
        }

        const lineText = line.text;
        const isActive = line.number === cursorLine;
        const from = line.from;
        const to = line.to;

        // Strongs
        decorations.push(...strongs(lineText, cursorPosition, from));

        // Italics
        decorations.push(...italics(lineText, cursorPosition, from));

        // Superscripts
        decorations.push(...superscripts(lineText, cursorPosition, from));

        // Strikethroughs
        decorations.push(...strikethroughs(lineText, cursorPosition, from));

        // Subscripts
        decorations.push(...subscripts(lineText, cursorPosition, from));

        // Quotes
        decorations.push(...blockquotes(lineText, isActive, from, to));

        // Headings
        decorations.push(...headings(line, lineText, isActive, from, to));

        // Horizontal Rules
        decorations.push(...horizontalRules(lineText, isActive, from, to));

        // Code
        decorations.push(...inlineCode(lineText, cursorPosition, from));

        // Links and Images
        decorations.push(...linksAndImages(lineText, isActive, from, referenceDefinitions));
      }

      // Lists
      decorations.push(
        ...lists({
          lines: lines.filter((line) => !tableLineNumbers.has(line.number)),
          cursorPosition,
        }),
      );

      // Apply the decorations
      decorations.sort(
        (a, b) =>
          a.from - b.from ||
          getDecorationStartSide(a.decoration) - getDecorationStartSide(b.decoration) ||
          a.to - b.to,
      );
      for (const range of decorations) {
        builder.add(range.from, range.to, range.decoration);
      }

      return builder.finish();
    }
  },
  {
    decorations: (v) => v.decorations,
  },
);
