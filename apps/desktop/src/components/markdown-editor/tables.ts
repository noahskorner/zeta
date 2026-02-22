import { Decoration, WidgetType } from '@uiw/react-codemirror';
import { DecorationRange } from './decoration-range';
import { MarkdownLine } from './lists';

type TableAlignment = 'left' | 'center' | 'right';

interface MarkdownTableBlock {
  from: number;
  to: number;
  headerFrom: number;
  headerTo: number;
  hiddenLinesFrom: Array<number>;
  lineNumbers: Set<number>;
  headers: Array<string>;
  rows: Array<Array<string>>;
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
    private readonly headers: Array<string>,
    private readonly rows: Array<Array<string>>,
    private readonly alignments: Array<TableAlignment>,
  ) {
    super();
  }

  eq(other: TableWidget): boolean {
    return (
      other.headers.join('\u001f') === this.headers.join('\u001f') &&
      other.rows.map((row) => row.join('\u001f')).join('\u001e') ===
        this.rows.map((row) => row.join('\u001f')).join('\u001e') &&
      other.alignments.join('\u001f') === this.alignments.join('\u001f')
    );
  }

  toDOM(): HTMLElement {
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
      cell.textContent = header;
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
        cell.textContent = value;
        rowElement.appendChild(cell);
      });

      body.appendChild(rowElement);
    });

    table.appendChild(head);
    table.appendChild(body);
    container.appendChild(table);
    return container;
  }
}

function parseTableRow(text: string): Array<string> | null {
  const trimmed = text.trim();
  if (!trimmed.includes('|')) {
    return null;
  }

  const normalized = trimmed.replace(/^\|/, '').replace(/\|$/, '');
  const cells = normalized.split(/(?<!\\)\|/).map((cell) => cell.trim().replace(/\\\|/g, '|'));
  if (cells.length < 2) {
    return null;
  }

  return cells;
}

function parseAlignment(separatorCell: string): TableAlignment | null {
  const trimmed = separatorCell.trim();
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

function normalizeRow(row: Array<string>, columnCount: number): Array<string> {
  if (row.length === columnCount) {
    return row;
  }

  const normalized = row.slice(0, columnCount);
  while (normalized.length < columnCount) {
    normalized.push('');
  }

  return normalized;
}

function detectMarkdownTables(lines: Array<MarkdownLine>): Array<MarkdownTableBlock> {
  const tables: Array<MarkdownTableBlock> = [];

  // Scan line-by-line for header + separator pairs and consume data rows.
  for (let index = 0; index < lines.length - 1; ) {
    const headerLine = lines[index];
    const separatorLine = lines[index + 1];
    const headerCells = parseTableRow(headerLine.text);
    const separatorCells = parseTableRow(separatorLine.text);

    if (!headerCells || !separatorCells || headerCells.length !== separatorCells.length) {
      index += 1;
      continue;
    }

    const alignments = separatorCells.map(parseAlignment);
    if (alignments.some((alignment) => alignment === null)) {
      index += 1;
      continue;
    }

    const rows: Array<Array<string>> = [];
    const lineNumbers = new Set<number>([headerLine.number, separatorLine.number]);
    let lastLine = separatorLine;
    let rowIndex = index + 2;

    while (rowIndex < lines.length) {
      const rowLine = lines[rowIndex];
      const rowCells = parseTableRow(rowLine.text);
      if (!rowCells) {
        break;
      }

      rows.push(normalizeRow(rowCells, headerCells.length));
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
      headers: normalizeRow(headerCells, headerCells.length),
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
