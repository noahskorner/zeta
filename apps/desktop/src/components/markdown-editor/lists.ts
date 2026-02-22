import { Decoration, EditorView, WidgetType } from '@uiw/react-codemirror';
import { createElement } from 'react';
import { createRoot, Root } from 'react-dom/client';
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
  lineFrom: number;
  lineTo: number;
  marker: string;
  markerFrom: number;
  markerTo: number;
  isChecklist: boolean;
  checklistFrom: number | null;
  checklistTo: number | null;
  checked: boolean;
}

interface ListsOptions {
  lines: Array<MarkdownLine>;
  cursorPosition: number;
}

class ListMarkerWidget extends WidgetType {
  constructor(
    private readonly marker: string,
    private readonly isChecklist: boolean,
  ) {
    super();
  }

  eq(other: ListMarkerWidget): boolean {
    return other.marker === this.marker && other.isChecklist === this.isChecklist;
  }

  toDOM(): HTMLElement {
    const container = document.createElement('span');
    container.className = 'cm-list-marker-slot';

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
    return other.checked === this.checked && other.from === this.from && other.to === this.to;
  }

  toDOM(view: EditorView): HTMLElement {
    const container = document.createElement('span');
    container.className = 'cm-checklist-widget';
    this.root = createRoot(container);

    this.root.render(
      createElement(Checkbox, {
        checked: this.checked,
        className: 'cm-checklist-checkbox rounded-sm',
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

export function lists({ lines, cursorPosition }: ListsOptions): Array<DecorationRange> {
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

    parsedItems.push({
      lineFrom: line.from,
      lineTo: line.to,
      marker,
      markerFrom,
      markerTo,
      isChecklist,
      checklistFrom,
      checklistTo,
      checked,
    });
  }

  // Add list marker/checklist widgets and marker hiding behavior.
  for (const item of parsedItems) {
    const lineActive = cursorPosition >= item.lineFrom && cursorPosition <= item.lineTo;
    const checklistRawActive =
      item.isChecklist &&
      item.checklistTo !== null &&
      cursorPosition >= item.lineFrom &&
      cursorPosition <= item.checklistTo + 1;
    const markerActive = item.isChecklist
      ? checklistRawActive
      : lineActive && cursorPosition >= item.markerFrom && cursorPosition <= item.markerTo;

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

    if (!markerActive && !item.isChecklist) {
      decorations.push({
        from: item.markerFrom,
        to: item.markerFrom,
        decoration: Decoration.widget({
          side: -1,
          widget: new ListMarkerWidget(item.marker, item.isChecklist),
        }),
      });
    }

    if (item.checklistFrom !== null && item.checklistTo !== null) {
      const checklistActive = checklistRawActive;

      decorations.push({
        from: item.checklistFrom,
        to: item.checklistTo,
        decoration: Decoration.mark({
          tagName: 'span',
          class: 'cm-markdown',
          attributes: {
            'data-active': `${checklistActive}`,
          },
        }),
      });

      if (checklistActive) {
        continue;
      }

      decorations.push({
        from: item.checklistFrom,
        to: item.checklistTo,
        decoration: Decoration.replace({
          widget: new ChecklistWidget(item.checked, item.checklistFrom, item.checklistTo),
        }),
      });
    }
  }

  return decorations;
}
