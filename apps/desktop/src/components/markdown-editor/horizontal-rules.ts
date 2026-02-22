import { Decoration, EditorView, WidgetType } from '@uiw/react-codemirror';
import { DecorationRange } from './decoration-range';

class HorizontalRuleWidget extends WidgetType {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  toDOM(_view: EditorView) {
    const hr = document.createElement('hr');
    hr.className = 'cm-hr';
    return hr;
  }
}

export function horizontalRules(
  lineText: string,
  isActive: boolean,
  from: number,
  to: number
): Array<DecorationRange> {
  const isHorizontalRule = /^\s{0,3}((\*\s*){3,}|(-\s*){3,}|(_\s*){3,})$/.test(lineText);

  if (!isHorizontalRule || isActive) return [];

  return [
    {
      from,
      to,
      decoration: Decoration.replace({
        widget: new HorizontalRuleWidget(),
      }),
    },
  ];
}
