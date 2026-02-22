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
import { tables } from './tables';
import { horizontalRules } from './horizontal-rules';
import { blockquotes } from './blockquotes';
import { inlineCode } from './inline-code';
import { strikethroughs } from './strikethroughs';
import { collectReferenceDefinitions, linksAndImages } from './links-and-images';

const mdExtension = markdown({
  codeLanguages: languages,
});

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
      extensions={[mdExtension, markdownPlugin]}
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
    decorations: DecorationSet;

    constructor(view: EditorView) {
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
      for (const { from: initialFrom, to: initialTo } of view.visibleRanges) {
        const content = view.state.doc.sliceString(initialFrom, initialTo);
        const lines = content.split('\n');
        const cursorPosition = view.state.selection.main.head;
        const cursorLine = view.state.doc.lineAt(cursorPosition).number;

        let position = initialFrom;
        let tableCount = 0;
        for (let lineNumber = 1; lineNumber <= lines.length; lineNumber++) {
          const line = view.state.doc.line(lineNumber);
          const lineText = lines[lineNumber - 1];
          const isActive = lineNumber == cursorLine;
          const from = position;
          const to = position + lineText.length;

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

          // Tables
          const { count: updatedTableCount, decorations: tableDecorations } = tables(
            line,
            lineText,
            isActive,
            from,
            to,
            tableCount,
          );
          tableCount = updatedTableCount;
          decorations.push(...tableDecorations);

          // Horizontal Rules
          decorations.push(...horizontalRules(lineText, isActive, from, to));

          // Code
          decorations.push(...inlineCode(lineText, cursorPosition, from));

          // Links and Images
          decorations.push(...linksAndImages(lineText, isActive, from, referenceDefinitions));

          // Increment the position
          position += lineText.length + 1;
        }
      }

      // Apply the decorations
      decorations.sort(
        (a, b) =>
          a.from - b.from ||
          (a.decoration.spec.startSide ?? 0) - (b.decoration.spec.startSide ?? 0),
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
