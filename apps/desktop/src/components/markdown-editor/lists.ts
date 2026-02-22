import { Decoration, EditorView, Line, WidgetType } from '@uiw/react-codemirror';
import { DecorationRange } from './decoration-range';
import { replaceMarkdown } from './replace-markdown';

class CheckboxWidget extends WidgetType {
  constructor(private from: number, private to: number, private isChecked: boolean) {
    super();
  }
  toDOM(view: EditorView) {
    // Wrapper <label> to group the hidden checkbox + custom display
    const wrapper = document.createElement('label');
    wrapper.className = 'cm-checkbox-wrapper';
    wrapper.style.display = 'inline-flex';
    wrapper.style.alignItems = 'center';

    // Hidden native checkbox
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = this.isChecked;
    input.style.display = this.isChecked ? 'none' : 'inline';

    // The custom styled box (span)
    const customBox = document.createElement('span');
    customBox.className = 'cm-checkbox';
    customBox.textContent = this.isChecked ? '✅' : '☐';
    customBox.style.marginRight = '0.5em';
    customBox.style.display = this.isChecked ? 'inline' : 'none';

    // Handle change and update both markdown + visual
    input.addEventListener('change', (e) => {
      const checked = (e.target as HTMLInputElement).checked;
      const replacement = checked ? '[x]' : '[ ]';
      customBox.textContent = checked ? '✅' : '☐';

      view.dispatch({
        changes: {
          from: this.from,
          to: this.to,
          insert: replacement,
        },
      });
    });

    // Optional: clicking the custom box toggles the hidden input
    customBox.addEventListener('click', () => {
      input.checked = !input.checked;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });

    wrapper.appendChild(input);
    wrapper.appendChild(customBox);

    return wrapper;
  }
}

export function lists(
  line: Line,
  lineText: string,
  isActive: boolean,
  from: number,
  to: number,
  count: number
): { count: number; decorations: Array<DecorationRange> } {
  const isList = lineText.match(/^(\s*)([-+*]|\d+\.)\s+/);

  if (!isList) {
    return { count: 0, decorations: [] };
  }

  const isOrdered = /\d+\./.test(isList[2]);
  const updatedCount = ++count;
  const decorations: DecorationRange[] = [
    ...replaceMarkdown(line.from, lineText, /^(\s*)([-+*]|\d+\.)/g, isActive),
  ];

  // Detect checklist pattern
  const checklistMatch = lineText.match(/\[(\s|x|X)\]/);
  if (checklistMatch && !isActive) {
    const match = checklistMatch[0];
    const isChecked = /[xX]/.test(match);
    const matchIndex = lineText.indexOf(match);

    decorations.push({
      from: line.from + matchIndex,
      to: line.from + matchIndex + match.length,
      decoration: Decoration.replace({
        widget: new CheckboxWidget(
          line.from + matchIndex,
          line.from + matchIndex + match.length,
          isChecked
        ),
      }),
    });
  } else {
    decorations.push({
      from: from,
      to: to,
      decoration: Decoration.mark({
        tagName: 'li',
        class: isOrdered ? 'cm-ol-list-item' : 'cm-ul-list-item',
        attributes: isOrdered
          ? {
              'data-list-number': `${updatedCount}`,
            }
          : undefined,
      }),
    });
  }

  return {
    count: updatedCount,
    decorations,
  };
}
