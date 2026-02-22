import { Decoration, EditorView, WidgetType } from '@uiw/react-codemirror';
import { createElement } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Checkbox } from '../ui/checkbox';
import { DecorationRange } from './decoration-range';

const LIST_PATTERN = /^(\s*)([-*]|\d+\.)\s+(.*)$/;
const CHECKLIST_PATTERN = /^\[( |x|X)\]\s+/;

export interface MarkdownLine {
  number: number;
  from: number;
  to: number;
  text: string;
}

interface ParsedListItem {
  key: string;
  lineNumber: number;
  indent: number;
  marker: string;
  markerFrom: number;
  markerTo: number;
  isChecklist: boolean;
  checklistFrom: number | null;
  checklistTo: number | null;
  checked: boolean;
  hasChildren: boolean;
  collapsed: boolean;
}

interface ListsOptions {
  lines: Array<MarkdownLine>;
  cursorPosition: number;
  collapsedKeys: Set<string>;
  onToggleCollapse: (key: string) => void;
  onRequestRefresh: () => void;
}

class ListMarkerWidget extends WidgetType {
  private root: Root | null = null;

  constructor(
    private readonly marker: string,
    private readonly isChecklist: boolean,
    private readonly hasChildren: boolean,
    private readonly collapsed: boolean,
    private readonly onToggle: (() => void) | null,
  ) {
    super();
  }

  eq(other: ListMarkerWidget): boolean {
    return (
      other.marker === this.marker &&
      other.isChecklist === this.isChecklist &&
      other.hasChildren === this.hasChildren &&
      other.collapsed === this.collapsed
    );
  }

  toDOM(): HTMLElement {
    const container = document.createElement('span');
    container.className = 'cm-list-marker-slot';

    if (this.hasChildren && this.onToggle) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'cm-list-toggle';
      button.setAttribute('aria-label', this.collapsed ? 'Expand list' : 'Collapse list');
      button.addEventListener('mousedown', (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.onToggle?.();
      });
      this.root = createRoot(button);
      this.root.render(
        createElement(this.collapsed ? ChevronRight : ChevronDown, {
          className: 'size-2',
        }),
      );
      container.appendChild(button);
    }

    if (!this.isChecklist) {
      const marker = document.createElement('span');
      marker.className = 'cm-list-marker-rendered';

      if (this.marker === '-' || this.marker === '*') {
        const bullet = document.createElement('span');
        bullet.className = 'cm-list-bullet-dot';
        marker.appendChild(bullet);
      } else {
        marker.textContent = this.marker;
      }

      container.appendChild(marker);
    }

    return container;
  }

  destroy(): void {
    this.root?.unmount();
    this.root = null;
  }

  ignoreEvent(): boolean {
    return false;
  }
}

class ChecklistWidget extends WidgetType {
  private root: Root | null = null;

  constructor(
    private readonly checked: boolean,
    private readonly from: number,
    private readonly to: number,
  ) {
    super();
  }

  eq(other: ChecklistWidget): boolean {
    return (
      other.checked === this.checked &&
      other.from === this.from &&
      other.to === this.to
    );
  }

  toDOM(view: EditorView): HTMLElement {
    const container = document.createElement('span');
    container.className = 'cm-checklist-widget';
    this.root = createRoot(container);

    this.root.render(
      createElement(Checkbox, {
        checked: this.checked,
        className: 'cm-checklist-checkbox',
        onMouseDown: (event) => {
          event.preventDefault();
          event.stopPropagation();
        },
        onCheckedChange: (value: boolean | 'indeterminate') => {
          const isChecked = value === true;
          view.dispatch({
            changes: {
              from: this.from,
              to: this.to,
              insert: isChecked ? '[x]' : '[ ]',
            },
          });
        },
      }),
    );

    return container;
  }

  destroy(): void {
    this.root?.unmount();
    this.root = null;
  }

  ignoreEvent(): boolean {
    return false;
  }
}

function indentWidth(whitespace: string): number {
  return whitespace.replace(/\t/g, '    ').length;
}

export function lists({
  lines,
  cursorPosition,
  collapsedKeys,
  onToggleCollapse,
  onRequestRefresh,
}: ListsOptions): Array<DecorationRange> {
  const decorations: Array<DecorationRange> = [];
  const parsedItems: Array<ParsedListItem> = [];

  // Parse every line into a list item model when it matches markdown list syntax.
  for (const line of lines) {
    const match = LIST_PATTERN.exec(line.text);
    if (!match) {
      continue;
    }

    const leadingWhitespace = match[1];
    const marker = match[2];
    const content = match[3];
    const prefixLength = line.text.length - content.length;
    const markerFrom = line.from + leadingWhitespace.length;
    const markerTo = markerFrom + marker.length;
    const checklistMatch = CHECKLIST_PATTERN.exec(content);
    const checklistFrom = checklistMatch ? line.from + prefixLength : null;
    const checklistTo = checklistFrom !== null ? checklistFrom + 3 : null;
    const checked = checklistMatch ? checklistMatch[1].toLowerCase() === 'x' : false;
    const isChecklist = checklistMatch !== null;
    const key = `${line.number}:${line.text.trim()}`;

    parsedItems.push({
      key,
      lineNumber: line.number,
      indent: indentWidth(leadingWhitespace),
      marker,
      markerFrom,
      markerTo,
      isChecklist,
      checklistFrom,
      checklistTo,
      checked,
      hasChildren: false,
      collapsed: false,
    });
  }

  const hiddenLineNumbers = new Set<number>();

  // Determine parent/child boundaries and gather hidden descendant lines for collapsed items.
  for (let index = 0; index < parsedItems.length; index++) {
    const current = parsedItems[index];
    const next = parsedItems[index + 1];
    current.hasChildren = Boolean(next && next.indent > current.indent);
    current.collapsed = collapsedKeys.has(current.key);

    if (!current.hasChildren || !current.collapsed) {
      continue;
    }

    let nextPeerIndex = -1;
    for (let inner = index + 1; inner < parsedItems.length; inner++) {
      if (parsedItems[inner].indent <= current.indent) {
        nextPeerIndex = inner;
        break;
      }
    }

    const endLine =
      nextPeerIndex === -1 ? lines.length : parsedItems[nextPeerIndex].lineNumber - 1;

    for (let lineNumber = current.lineNumber + 1; lineNumber <= endLine; lineNumber++) {
      hiddenLineNumbers.add(lineNumber);
    }
  }

  // Add list marker/checklist/toggle widgets and marker hiding behavior.
  for (const item of parsedItems) {
    const markerActive = !item.isChecklist && cursorPosition === item.markerTo;

    decorations.push({
      from: item.markerFrom,
      to: item.markerTo,
      decoration: Decoration.mark({
        tagName: 'span',
        class: 'cm-markdown',
        attributes: {
          'data-active': `${markerActive}`,
        },
      }),
    });

    if (!markerActive) {
      decorations.push({
        from: item.markerFrom,
        to: item.markerFrom,
        decoration: Decoration.widget({
          side: -1,
          widget: new ListMarkerWidget(
            item.marker,
            item.isChecklist,
            item.hasChildren,
            item.collapsed,
            item.hasChildren
              ? () => {
                  onToggleCollapse(item.key);
                  onRequestRefresh();
                }
              : null,
          ),
        }),
      });
    }

    if (item.checklistFrom !== null && item.checklistTo !== null) {
      decorations.push({
        from: item.checklistFrom,
        to: item.checklistTo,
        decoration: Decoration.replace({
          widget: new ChecklistWidget(item.checked, item.checklistFrom, item.checklistTo),
        }),
      });
    }
  }

  // Hide descendants for collapsed list items.
  for (const lineNumber of hiddenLineNumbers) {
    const line = lines[lineNumber - 1];
    if (!line) {
      continue;
    }

    decorations.push({
      from: line.from,
      to: line.from,
      decoration: Decoration.line({
        attributes: {
          'data-list-hidden': 'true',
        },
      }),
    });
  }

  return decorations;
}
