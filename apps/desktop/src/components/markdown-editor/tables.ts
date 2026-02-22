import { Decoration, EditorView, WidgetType } from '@uiw/react-codemirror';
import { DecorationRange } from './decoration-range';
import { MarkdownLine } from './lists';

type TableAlignment = 'left' | 'center' | 'right';

interface TableCell {
  text: string;
  raw: string;
  from: number;
  to: number;
}

interface MarkdownTableBlock {
  from: number;
  to: number;
  headerFrom: number;
  headerTo: number;
  hiddenLinesFrom: Array<number>;
  lineNumbers: Set<number>;
  headers: Array<TableCell>;
  rows: Array<Array<TableCell>>;
  alignments: Array<TableAlignment>;
}

interface TablesOptions {
  lines: Array<MarkdownLine>;
  selectionFrom: number;
  selectionTo: number;
}

interface TablesResult {
  decorations: Array<DecorationRange>;
  tableLineNumbers: Set<number>;
}

class TableWidget extends WidgetType {
  constructor(
    private readonly headers: Array<TableCell>,
    private readonly rows: Array<Array<TableCell>>,
    private readonly alignments: Array<TableAlignment>,
  ) {
    super();
  }

  eq(other: TableWidget): boolean {
    return (
      other.headers.map((header) => header.raw).join('\u001f') ===
        this.headers.map((header) => header.raw).join('\u001f') &&
      other.rows
        .map((row) => row.map((cell) => cell.raw).join('\u001f'))
        .join('\u001e') ===
        this.rows.map((row) => row.map((cell) => cell.raw).join('\u001f')).join('\u001e') &&
      other.alignments.join('\u001f') === this.alignments.join('\u001f')
    );
  }

  toDOM(view: EditorView): HTMLElement {
    const container = document.createElement('div');
    container.className = 'cm-table-widget';

    const table = document.createElement('table');
    table.className = 'cm-table-preview';

    const head = document.createElement('thead');
    const headRow = document.createElement('tr');
    headRow.className = 'cm-table-preview-row';

    // Build the header row from parsed markdown header cells.
    this.headers.forEach((header, index) => {
      const cell = document.createElement('th');
      cell.className = 'cm-table-preview-header';
      cell.setAttribute('data-align', this.alignments[index] ?? 'left');
      cell.setAttribute('data-cell-from', `${header.from}`);
      cell.setAttribute('data-cell-to', `${header.to}`);
      renderInlineMarkdown(cell, header.raw, header.from);
      headRow.appendChild(cell);
    });
    head.appendChild(headRow);

    const body = document.createElement('tbody');
    // Build each data row as plain text cells.
    this.rows.forEach((row) => {
      const rowElement = document.createElement('tr');
      rowElement.className = 'cm-table-preview-row';

      row.forEach((value, index) => {
        const cell = document.createElement('td');
        cell.className = 'cm-table-preview-cell';
        cell.setAttribute('data-align', this.alignments[index] ?? 'left');
        cell.setAttribute('data-cell-from', `${value.from}`);
        cell.setAttribute('data-cell-to', `${value.to}`);
        renderInlineMarkdown(cell, value.raw, value.from);
        rowElement.appendChild(cell);
      });

      body.appendChild(rowElement);
    });

    table.addEventListener('mousedown', (event) => {
      const target = event.target as HTMLElement | null;
      if (!target) {
        return;
      }

      const fromToElement = target.closest('[data-pos-from][data-pos-to]') as HTMLElement | null;
      if (fromToElement) {
        const from = Number(fromToElement.getAttribute('data-pos-from'));
        const to = Number(fromToElement.getAttribute('data-pos-to'));
        if (!Number.isNaN(from) && !Number.isNaN(to)) {
          const anchor = getMappedPositionFromClick(
            fromToElement,
            event.clientX,
            from,
            to,
            fromToElement.getAttribute('data-pos-map'),
          );
          event.preventDefault();
          event.stopPropagation();
          view.dispatch({
            selection: { anchor },
            scrollIntoView: true,
          });
          view.focus();
          return;
        }
      }

      const cellElement = target.closest('[data-cell-from][data-cell-to]') as HTMLElement | null;
      if (!cellElement) {
        return;
      }

      const from = Number(cellElement.getAttribute('data-cell-from'));
      if (Number.isNaN(from)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      view.dispatch({
        selection: { anchor: from },
        scrollIntoView: true,
      });
      view.focus();
    });

    table.appendChild(head);
    table.appendChild(body);
    container.appendChild(table);
    return container;
  }

  ignoreEvent(): boolean {
    return false;
  }
}

function isEscapedCharacter(text: string, index: number): boolean {
  let backslashes = 0;
  for (let i = index - 1; i >= 0 && text[i] === '\\'; i--) {
    backslashes += 1;
  }

  return backslashes % 2 === 1;
}

function parseTableRow(text: string, lineFrom: number): Array<TableCell> | null {
  const trimmed = text.trim();
  if (!trimmed.includes('|')) {
    return null;
  }

  let rowStart = 0;
  while (rowStart < text.length && /\s/.test(text[rowStart])) {
    rowStart += 1;
  }

  let rowEnd = text.length;
  while (rowEnd > rowStart && /\s/.test(text[rowEnd - 1])) {
    rowEnd -= 1;
  }

  if (rowStart >= rowEnd) {
    return null;
  }

  if (text[rowStart] === '|') {
    rowStart += 1;
  }
  if (rowEnd > rowStart && text[rowEnd - 1] === '|') {
    rowEnd -= 1;
  }

  const cells: Array<TableCell> = [];
  let segmentStart = rowStart;
  for (let index = rowStart; index <= rowEnd; index++) {
    const isBoundary = index === rowEnd;
    const isPipeBoundary = !isBoundary && text[index] === '|' && !isEscapedCharacter(text, index);
    if (!isBoundary && !isPipeBoundary) {
      continue;
    }

    const rawSegment = text.slice(segmentStart, index);
    const leadingWhitespace = rawSegment.match(/^\s*/)?.[0].length ?? 0;
    const trailingWhitespace = rawSegment.match(/\s*$/)?.[0].length ?? 0;
    const contentStart = segmentStart + leadingWhitespace;
    const contentEnd = Math.max(contentStart, index - trailingWhitespace);
    const rawContent = text.slice(contentStart, contentEnd);

    cells.push({
      text: rawContent.replace(/\\\|/g, '|'),
      raw: rawContent,
      from: lineFrom + contentStart,
      to: lineFrom + contentEnd,
    });

    segmentStart = index + 1;
  }

  if (cells.length < 2) {
    return null;
  }

  return cells;
}

function parseAlignment(separatorCell: TableCell): TableAlignment | null {
  const trimmed = separatorCell.text.trim();
  if (!/^:?-{3,}:?$/.test(trimmed)) {
    return null;
  }

  const left = trimmed.startsWith(':');
  const right = trimmed.endsWith(':');
  if (left && right) {
    return 'center';
  }

  if (right) {
    return 'right';
  }

  return 'left';
}

function normalizeRow(row: Array<TableCell>, columnCount: number, fallbackFrom: number): Array<TableCell> {
  if (row.length === columnCount) {
    return row;
  }

  const normalized = row.slice(0, columnCount);
  while (normalized.length < columnCount) {
    normalized.push({
      text: '',
      raw: '',
      from: fallbackFrom,
      to: fallbackFrom,
    });
  }

  return normalized;
}

function detectMarkdownTables(lines: Array<MarkdownLine>): Array<MarkdownTableBlock> {
  const tables: Array<MarkdownTableBlock> = [];

  // Scan line-by-line for header + separator pairs and consume data rows.
  for (let index = 0; index < lines.length - 1; ) {
    const headerLine = lines[index];
    const separatorLine = lines[index + 1];
    const headerCells = parseTableRow(headerLine.text, headerLine.from);
    const separatorCells = parseTableRow(separatorLine.text, separatorLine.from);

    if (!headerCells || !separatorCells || headerCells.length !== separatorCells.length) {
      index += 1;
      continue;
    }

    const alignments = separatorCells.map(parseAlignment);
    if (alignments.some((alignment) => alignment === null)) {
      index += 1;
      continue;
    }

    const rows: Array<Array<TableCell>> = [];
    const lineNumbers = new Set<number>([headerLine.number, separatorLine.number]);
    let lastLine = separatorLine;
    let rowIndex = index + 2;

    while (rowIndex < lines.length) {
      const rowLine = lines[rowIndex];
      const rowCells = parseTableRow(rowLine.text, rowLine.from);
      if (!rowCells) {
        break;
      }

      rows.push(normalizeRow(rowCells, headerCells.length, rowLine.to));
      lineNumbers.add(rowLine.number);
      lastLine = rowLine;
      rowIndex += 1;
    }

    tables.push({
      from: headerLine.from,
      to: lastLine.to,
      headerFrom: headerLine.from,
      headerTo: headerLine.to,
      hiddenLinesFrom: lines
        .slice(index + 1, rowIndex)
        .map((line) => line.from),
      lineNumbers,
      headers: normalizeRow(headerCells, headerCells.length, headerLine.to),
      rows,
      alignments: alignments as Array<TableAlignment>,
    });

    index = rowIndex;
  }

  return tables;
}

export function tables({ lines, selectionFrom, selectionTo }: TablesOptions): TablesResult {
  const decorations: Array<DecorationRange> = [];
  const tableLineNumbers = new Set<number>();
  const tableBlocks = detectMarkdownTables(lines);

  for (const table of tableBlocks) {
    table.lineNumbers.forEach((lineNumber) => tableLineNumbers.add(lineNumber));

    // Keep raw markdown visible while any part of the table is selected.
    const intersectsSelection = selectionFrom <= table.to && selectionTo >= table.from;
    if (intersectsSelection) {
      continue;
    }

    decorations.push({
      from: table.headerFrom,
      to: table.headerTo,
      decoration: Decoration.replace({
        widget: new TableWidget(table.headers, table.rows, table.alignments),
      }),
    });

    for (const lineFrom of table.hiddenLinesFrom) {
      decorations.push({
        from: lineFrom,
        to: lineFrom,
        decoration: Decoration.line({
          attributes: {
            'data-table-hidden': 'true',
          },
        }),
      });
    }
  }

  return {
    decorations,
    tableLineNumbers,
  };
}

type InlineSegment =
  | {
      kind: 'text';
      text: string;
      positions: Array<number>;
    }
  | {
      kind: 'element';
      tag: 'strong' | 'em' | 'code' | 'del' | 'sup' | 'sub';
      segments: Array<InlineSegment>;
    };

type InlineElementTag = Extract<InlineSegment, { kind: 'element' }>['tag'];

function decodeEscapedText(rawText: string, absoluteFrom: number): { text: string; positions: Array<number> } {
  const textParts: Array<string> = [];
  const positions: Array<number> = [];

  for (let index = 0; index < rawText.length; index++) {
    if (rawText[index] === '\\' && index + 1 < rawText.length) {
      textParts.push(rawText[index + 1]);
      positions.push(absoluteFrom + index + 1);
      index += 1;
      continue;
    }

    textParts.push(rawText[index]);
    positions.push(absoluteFrom + index);
  }

  return {
    text: textParts.join(''),
    positions,
  };
}

function findClosingDelimiter(rawText: string, delimiter: string, fromIndex: number): number {
  for (let index = fromIndex; index < rawText.length; index++) {
    if (!rawText.startsWith(delimiter, index)) {
      continue;
    }
    if (isEscapedCharacter(rawText, index)) {
      continue;
    }

    if ((delimiter === '*' || delimiter === '_') && rawText[index - 1] === delimiter) {
      continue;
    }

    if (delimiter === '~' && rawText[index - 1] === '~') {
      continue;
    }

    return index;
  }

  return -1;
}

function parseInlineSegments(rawText: string, absoluteFrom: number): Array<InlineSegment> {
  const segments: Array<InlineSegment> = [];
  let textStart = 0;
  let index = 0;

  const flushText = (end: number) => {
    if (end <= textStart) {
      return;
    }

    const rawSlice = rawText.slice(textStart, end);
    const decoded = decodeEscapedText(rawSlice, absoluteFrom + textStart);
    if (!decoded.text) {
      return;
    }

    segments.push({
      kind: 'text',
      text: decoded.text,
      positions: decoded.positions,
    });
  };

  while (index < rawText.length) {
    if (isEscapedCharacter(rawText, index)) {
      index += 1;
      continue;
    }

    const rawAtIndex = rawText[index];
    const hasStrong = rawText.startsWith('**', index) || rawText.startsWith('__', index);
    const hasStrike = rawText.startsWith('~~', index);
    const hasCode = rawAtIndex === '`';
    const hasEmphasis =
      (rawAtIndex === '*' || rawAtIndex === '_') &&
      rawText[index + 1] !== rawAtIndex &&
      rawText[index - 1] !== rawAtIndex;
    const hasSuperscript = rawAtIndex === '^';
    const hasSubscript = rawAtIndex === '~' && rawText[index + 1] !== '~' && rawText[index - 1] !== '~';

    if (!hasStrong && !hasStrike && !hasCode && !hasEmphasis && !hasSuperscript && !hasSubscript) {
      index += 1;
      continue;
    }

    let delimiter = '';
    let tag: InlineElementTag = 'strong';
    if (hasStrong) {
      delimiter = rawText.slice(index, index + 2);
      tag = 'strong';
    } else if (hasStrike) {
      delimiter = '~~';
      tag = 'del';
    } else if (hasCode) {
      delimiter = '`';
      tag = 'code';
    } else if (hasSuperscript) {
      delimiter = '^';
      tag = 'sup';
    } else if (hasSubscript) {
      delimiter = '~';
      tag = 'sub';
    } else {
      delimiter = rawAtIndex;
      tag = 'em';
    }

    const openingLength = delimiter.length;
    const closingIndex = findClosingDelimiter(rawText, delimiter, index + openingLength);
    if (closingIndex === -1 || closingIndex <= index + openingLength) {
      index += 1;
      continue;
    }

    flushText(index);

    const contentStart = index + openingLength;
    const contentEnd = closingIndex;
    const contentRaw = rawText.slice(contentStart, contentEnd);
    const contentAbsoluteFrom = absoluteFrom + contentStart;
    const innerSegments =
      tag === 'code'
        ? [
            {
              kind: 'text' as const,
              ...decodeEscapedText(contentRaw, contentAbsoluteFrom),
            },
          ]
        : parseInlineSegments(contentRaw, contentAbsoluteFrom);

    segments.push({
      kind: 'element',
      tag,
      segments: innerSegments,
    });

    index = closingIndex + openingLength;
    textStart = index;
  }

  flushText(rawText.length);
  return segments;
}

function getSegmentBounds(segments: Array<InlineSegment>): { from: number; to: number } | null {
  let from = Number.POSITIVE_INFINITY;
  let to = Number.NEGATIVE_INFINITY;

  const walk = (segment: InlineSegment) => {
    if (segment.kind === 'text') {
      if (segment.positions.length === 0) {
        return;
      }

      from = Math.min(from, segment.positions[0]);
      to = Math.max(to, segment.positions[segment.positions.length - 1] + 1);
      return;
    }

    segment.segments.forEach(walk);
  };

  segments.forEach(walk);

  if (!Number.isFinite(from) || !Number.isFinite(to)) {
    return null;
  }

  return { from, to };
}

function appendSegments(container: HTMLElement, segments: Array<InlineSegment>) {
  for (const segment of segments) {
    if (segment.kind === 'text') {
      if (!segment.text) {
        continue;
      }

      const span = document.createElement('span');
      span.textContent = segment.text;

      if (segment.positions.length > 0) {
        span.setAttribute('data-pos-from', `${segment.positions[0]}`);
        span.setAttribute('data-pos-to', `${segment.positions[segment.positions.length - 1] + 1}`);
        span.setAttribute('data-pos-map', segment.positions.join('.'));
      }

      container.appendChild(span);
      continue;
    }

    const element = document.createElement(segment.tag);
    if (segment.tag === 'code') {
      element.className = 'cm-inline-code';
    }
    if (segment.tag === 'del') {
      element.className = 'cm-strikethrough';
    }

    appendSegments(element, segment.segments);

    const bounds = getSegmentBounds(segment.segments);
    if (bounds) {
      element.setAttribute('data-pos-from', `${bounds.from}`);
      element.setAttribute('data-pos-to', `${bounds.to}`);
    }

    container.appendChild(element);
  }
}

function renderInlineMarkdown(container: HTMLElement, rawText: string, absoluteFrom: number) {
  const segments = parseInlineSegments(rawText, absoluteFrom);
  if (segments.length === 0) {
    container.textContent = rawText.replace(/\\\|/g, '|');
    return;
  }

  appendSegments(container, segments);
}

function getMappedPositionFromClick(
  element: HTMLElement,
  clientX: number,
  from: number,
  to: number,
  map: string | null,
): number {
  if (from >= to) {
    return from;
  }

  const rect = element.getBoundingClientRect();
  if (rect.width <= 0) {
    return from;
  }

  const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
  const mappedIndexes = map
    ? map
        .split('.')
        .map((value) => Number(value))
        .filter((value) => !Number.isNaN(value))
    : [];

  if (mappedIndexes.length > 0) {
    const index = Math.min(mappedIndexes.length - 1, Math.round(ratio * (mappedIndexes.length - 1)));
    return mappedIndexes[index];
  }

  const size = Math.max(1, to - from);
  const offset = Math.min(size - 1, Math.round(ratio * (size - 1)));
  return from + offset;
}
