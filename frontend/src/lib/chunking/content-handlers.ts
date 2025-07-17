/**
 * Specialized content type handlers for manufacturing manuals
 */

import { PDFContent } from '../types/chunking';

export interface TableStructure {
  headers: string[];
  rows: string[][];
  caption?: string;
  position: number;
  pageNumber: number;
  columnCount: number;
  rowCount: number;
}

export interface ListStructure {
  type: 'bullet' | 'numbered' | 'definition';
  items: ListItem[];
  position: number;
  pageNumber: number;
  isNested: boolean;
  level: number;
}

export interface ListItem {
  content: string;
  index?: number;
  bulletType?: string;
  subItems?: ListItem[];
  level: number;
}

export interface DiagramReference {
  type: 'diagram' | 'image' | 'figure' | 'chart';
  title?: string;
  caption?: string;
  reference: string;
  position: number;
  pageNumber: number;
  dimensions?: {
    width?: number;
    height?: number;
  };
}

export interface CodeBlock {
  language?: string;
  content: string;
  position: number;
  pageNumber: number;
  lineNumbers?: boolean;
}

export interface SpecialContentContext {
  tables: TableStructure[];
  lists: ListStructure[];
  diagrams: DiagramReference[];
  codeBlocks: CodeBlock[];
  technicalFormats: TechnicalFormat[];
}

export interface TechnicalFormat {
  type: 'formula' | 'measurement' | 'specification' | 'part_number' | 'model_number';
  content: string;
  position: number;
  pageNumber: number;
  context?: string;
}

/**
 * Detects and extracts table structures from text content
 */
export function extractTables(content: string, pageNumber: number): TableStructure[] {
  const tables: TableStructure[] = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect table patterns
    if (isTableRow(line)) {
      const table = parseTableFromPosition(lines, i, pageNumber);
      if (table) {
        tables.push(table);
        i += table.rowCount; // Skip processed rows
      }
    }
  }

  return tables;
}

/**
 * Determines if a line represents a table row
 */
function isTableRow(line: string): boolean {
  // Look for common table patterns
  const tablePatterns = [
    /^\s*\|.*\|.*\|/, // Markdown-style table
    /^\s*[^\|]*\|[^\|]*\|[^\|]*/, // Basic pipe-separated
    /^\s*\+[-=]+\+/, // ASCII table borders
    /^\s*[-=]{3,}\s+[-=]{3,}/, // Dashed separators
  ];

  return tablePatterns.some((pattern) => pattern.test(line));
}

/**
 * Parses a complete table structure from a starting position
 */
function parseTableFromPosition(
  lines: string[],
  startIndex: number,
  pageNumber: number,
): TableStructure | null {
  const tableLines: string[] = [];
  let currentIndex = startIndex;

  // Collect all table lines
  while (
    currentIndex < lines.length &&
    (isTableRow(lines[currentIndex]) || isTableSeparator(lines[currentIndex]))
  ) {
    tableLines.push(lines[currentIndex]);
    currentIndex++;
  }

  if (tableLines.length < 2) return null;

  // Parse table structure
  const headers = parseTableHeaders(tableLines);
  const rows = parseTableRows(tableLines, headers.length);

  // Look for caption above or below
  const caption = findTableCaption(lines, startIndex, currentIndex);

  return {
    headers,
    rows,
    caption,
    position: startIndex,
    pageNumber,
    columnCount: headers.length,
    rowCount: rows.length,
  };
}

/**
 * Determines if a line is a table separator
 */
function isTableSeparator(line: string): boolean {
  return /^\s*[|\-\+=\s]+$/.test(line);
}

/**
 * Parses table headers from table lines
 */
function parseTableHeaders(tableLines: string[]): string[] {
  const headerLine = tableLines.find((line) => !isTableSeparator(line));
  if (!headerLine) return [];

  // Handle different table formats
  if (headerLine.includes('|')) {
    return headerLine
      .split('|')
      .map((cell) => cell.trim())
      .filter((cell) => cell.length > 0);
  }

  // Space-separated headers
  return headerLine
    .trim()
    .split(/\s{2,}/)
    .filter((cell) => cell.length > 0);
}

/**
 * Parses table rows from table lines
 */
function parseTableRows(tableLines: string[], columnCount: number): string[][] {
  const rows: string[][] = [];
  let foundFirstDataRow = false;

  for (const line of tableLines) {
    if (isTableSeparator(line)) continue;

    let cells: string[];
    if (line.includes('|')) {
      cells = line
        .split('|')
        .map((cell) => cell.trim())
        .filter((cell) => cell.length > 0);
    } else {
      cells = line
        .trim()
        .split(/\s{2,}/)
        .filter((cell) => cell.length > 0);
    }

    // Skip the header row (first non-separator row)
    if (!foundFirstDataRow) {
      foundFirstDataRow = true;
      continue;
    }

    // Ensure consistent column count
    while (cells.length < columnCount) {
      cells.push('');
    }

    if (cells.length > 0) {
      rows.push(cells.slice(0, columnCount));
    }
  }

  return rows;
}

/**
 * Finds table caption above or below the table
 */
function findTableCaption(
  lines: string[],
  startIndex: number,
  endIndex: number,
): string | undefined {
  // Look above the table
  if (startIndex > 0) {
    const aboveLine = lines[startIndex - 1].trim();
    if (aboveLine.match(/^(Table|Figure|Chart)\s+\d+/i)) {
      return aboveLine;
    }
  }

  // Look below the table
  if (endIndex < lines.length) {
    const belowLine = lines[endIndex].trim();
    if (belowLine.match(/^(Table|Figure|Chart)\s+\d+/i)) {
      return belowLine;
    }
  }

  return undefined;
}

/**
 * Extracts list structures from text content
 */
export function extractLists(content: string, pageNumber: number): ListStructure[] {
  const lists: ListStructure[] = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (isListItem(line)) {
      const list = parseListFromPosition(lines, i, pageNumber);
      if (list) {
        lists.push(list);
        i += list.items.length; // Skip processed items
      }
    }
  }

  return lists;
}

/**
 * Determines if a line is a list item
 */
function isListItem(line: string): boolean {
  const listPatterns = [
    /^\s*[•·▪▫▸▹‣⁃]\s+/, // Bullet points
    /^\s*[-*+]\s+/, // Dash/asterisk bullets
    /^\s*\d+\.\s+/, // Numbered lists
    /^\s*[a-zA-Z]\.\s+/, // Lettered lists
    /^\s*[ivxlcdm]+\.\s+/i, // Roman numerals
    /^\s*\(\d+\)\s+/, // Parenthetical numbers
    /^\s*\d+\)\s+/, // Number with closing paren
    /^\s*Step\s+\d+:/i, // Step instructions
    /^\s*\w+:\s+/, // Definition lists
  ];

  return listPatterns.some((pattern) => pattern.test(line));
}

/**
 * Parses a complete list structure from a starting position
 */
function parseListFromPosition(
  lines: string[],
  startIndex: number,
  pageNumber: number,
): ListStructure | null {
  const items: ListItem[] = [];
  let currentIndex = startIndex;
  let listType: 'bullet' | 'numbered' | 'definition' = 'bullet';
  let maxLevel = 0;

  // Determine list type from first item
  const firstLine = lines[startIndex];
  if (/^\s*\d+\./.test(firstLine)) {
    listType = 'numbered';
  } else if (/^\s*\w+:\s+/.test(firstLine)) {
    listType = 'definition';
  }

  // Parse all consecutive list items
  while (currentIndex < lines.length) {
    const line = lines[currentIndex];

    if (isListItem(line)) {
      const item = parseListItem(line, currentIndex);
      if (item) {
        items.push(item);
        maxLevel = Math.max(maxLevel, item.level);
      }
      currentIndex++;
    } else if (line.trim() === '') {
      // Empty line, check if next line is still a list item
      if (currentIndex + 1 < lines.length && isListItem(lines[currentIndex + 1])) {
        currentIndex++;
        continue;
      } else {
        break;
      }
    } else {
      break;
    }
  }

  if (items.length === 0) return null;

  return {
    type: listType,
    items,
    position: startIndex,
    pageNumber,
    isNested: maxLevel > 0,
    level: maxLevel,
  };
}

/**
 * Parses a single list item
 */
function parseListItem(line: string, position: number): ListItem | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  // Calculate indentation level
  const indentMatch = line.match(/^(\s*)/);
  const level = indentMatch ? Math.floor(indentMatch[1].length / 2) : 0;

  // Extract content and type
  let content = '';
  let index: number | undefined;
  let bulletType: string | undefined;

  // Numbered list
  const numberedMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
  if (numberedMatch) {
    index = parseInt(numberedMatch[1]);
    content = numberedMatch[2];
    bulletType = 'numbered';
  } else {
    // Bullet list
    const bulletMatch = trimmed.match(/^([•·▪▫▸▹‣⁃\-*+])\s+(.+)$/);
    if (bulletMatch) {
      bulletType = bulletMatch[1];
      content = bulletMatch[2];
    } else {
      // Definition list
      const definitionMatch = trimmed.match(/^(\w+):\s+(.+)$/);
      if (definitionMatch) {
        bulletType = 'definition';
        content = `${definitionMatch[1]}: ${definitionMatch[2]}`;
      } else {
        content = trimmed;
      }
    }
  }

  return {
    content,
    index,
    bulletType,
    level,
  };
}

/**
 * Extracts diagram and image references from text content
 */
export function extractDiagrams(content: string, pageNumber: number): DiagramReference[] {
  const diagrams: DiagramReference[] = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Look for diagram references
    const diagramPatterns = [
      /(?:Figure|Fig\.?)\s+(\d+(?:\.\d+)?)\s*[-:]?\s*(.+)/i,
      /(?:Diagram|Diag\.?)\s+(\d+(?:\.\d+)?)\s*[-:]?\s*(.+)/i,
      /(?:Chart|Graph)\s+(\d+(?:\.\d+)?)\s*[-:]?\s*(.+)/i,
      /(?:Image|Picture)\s+(\d+(?:\.\d+)?)\s*[-:]?\s*(.+)/i,
      /\[(?:image|figure|diagram|chart)\]/i,
      /See\s+(?:figure|diagram|chart|image)\s+(\d+)/i,
    ];

    for (const pattern of diagramPatterns) {
      const match = line.match(pattern);
      if (match) {
        const diagram: DiagramReference = {
          type: determineDiagramType(line),
          reference: match[1] || 'unnamed',
          title: match[2]?.trim(),
          position: i,
          pageNumber,
        };

        // Look for caption on next line
        if (i + 1 < lines.length && lines[i + 1].trim()) {
          diagram.caption = lines[i + 1].trim();
        }

        diagrams.push(diagram);
        break;
      }
    }
  }

  return diagrams;
}

/**
 * Determines the type of diagram from the text
 */
function determineDiagramType(text: string): DiagramReference['type'] {
  const lowerText = text.toLowerCase();

  if (
    lowerText.includes('figure') ||
    lowerText.includes('fig.') ||
    lowerText.includes('illustration')
  ) {
    return 'figure';
  } else if (lowerText.includes('chart') || lowerText.includes('graph')) {
    return 'chart';
  } else if (lowerText.includes('diagram') || lowerText.includes('schematic')) {
    return 'diagram';
  } else {
    return 'image';
  }
}

/**
 * Extracts code blocks from text content
 */
export function extractCodeBlocks(content: string, pageNumber: number): CodeBlock[] {
  const codeBlocks: CodeBlock[] = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Look for code block markers
    const codeBlockStart = line.match(/^```(\w+)?/);
    if (codeBlockStart) {
      const language = codeBlockStart[1];
      const codeContent: string[] = [];
      let j = i + 1;

      // Collect code content until closing marker
      while (j < lines.length && !lines[j].startsWith('```')) {
        codeContent.push(lines[j]);
        j++;
      }

      if (j < lines.length) {
        // Found closing marker
        codeBlocks.push({
          language,
          content: codeContent.join('\n'),
          position: i,
          pageNumber,
          lineNumbers: false,
        });

        i = j; // Skip to after closing marker
      }
    } else if (i === 0 || !lines[i - 1].startsWith('```')) {
      // Look for indented code blocks (4+ spaces) - but not if we just processed a fenced block
      const indentedCode = line.match(/^    (.+)/);
      if (indentedCode) {
        const codeContent: string[] = [indentedCode[1]];
        let j = i + 1;

        // Collect consecutive indented lines
        while (j < lines.length && (lines[j].startsWith('    ') || lines[j].trim() === '')) {
          if (lines[j].startsWith('    ')) {
            codeContent.push(lines[j].substring(4));
          } else {
            codeContent.push('');
          }
          j++;
        }

        codeBlocks.push({
          content: codeContent.join('\n').trim(),
          position: i,
          pageNumber,
          lineNumbers: false,
        });

        i = j - 1; // Skip processed lines
      }
    }
  }

  return codeBlocks;
}

/**
 * Extracts technical formatting patterns common in manufacturing manuals
 */
export function extractTechnicalFormats(content: string, pageNumber: number): TechnicalFormat[] {
  const formats: TechnicalFormat[] = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Measurements and specifications
    const measurementPatterns = [
      /(\d+(?:\.\d+)?)\s*(mm|cm|m|in|ft|kg|lb|oz|°C|°F|Hz|MHz|GHz|V|A|W|kW|PSI|bar|rpm)/gi,
      /(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)\s*(mm|cm|m|in)/gi,
      /(\d+(?:\.\d+)?)\s*±\s*(\d+(?:\.\d+)?)\s*(mm|cm|m|in)/gi,
    ];

    for (const pattern of measurementPatterns) {
      let match;
      while ((match = pattern.exec(line)) !== null) {
        formats.push({
          type: 'measurement',
          content: match[0],
          position: i,
          pageNumber,
          context: line.trim(),
        });
      }
    }

    // Part numbers and model numbers
    const partNumberPatterns = [
      /\b[A-Z]{1,3}[-_]?\d{3,}[-_]?[A-Z]*\b/g, // Common part number formats
      /\b(?:Part|Model|Serial)\s*#?\s*:?\s*([A-Z0-9\-_]+)/gi,
      /\b(?:P\/N|M\/N|S\/N)\s*:?\s*([A-Z0-9\-_]+)/gi,
    ];

    for (const pattern of partNumberPatterns) {
      let match;
      while ((match = pattern.exec(line)) !== null) {
        formats.push({
          type: 'part_number',
          content: match[1] || match[0],
          position: i,
          pageNumber,
          context: line.trim(),
        });
      }
    }

    // Formulas and calculations
    const formulaPatterns = [
      /\b[A-Z]\s*=\s*[A-Z0-9\+\-\*\/\(\)\s]+/g,
      /\b(?:Formula|Equation)\s*:?\s*(.+)/gi,
    ];

    for (const pattern of formulaPatterns) {
      let match;
      while ((match = pattern.exec(line)) !== null) {
        formats.push({
          type: 'formula',
          content: match[1] || match[0],
          position: i,
          pageNumber,
          context: line.trim(),
        });
      }
    }
  }

  return formats;
}

/**
 * Analyzes content and extracts all special content types
 */
export function analyzeSpecialContent(content: string, pageNumber: number): SpecialContentContext {
  return {
    tables: extractTables(content, pageNumber),
    lists: extractLists(content, pageNumber),
    diagrams: extractDiagrams(content, pageNumber),
    codeBlocks: extractCodeBlocks(content, pageNumber),
    technicalFormats: extractTechnicalFormats(content, pageNumber),
  };
}

/**
 * Determines if content should be kept together during chunking
 */
export function shouldKeepTogether(
  content: string,
  specialContent: SpecialContentContext,
): boolean {
  // Keep tables together
  if (specialContent.tables.length > 0) {
    return true;
  }

  // Keep lists together if they're short
  if (specialContent.lists.length > 0) {
    const totalListItems = specialContent.lists.reduce((sum, list) => sum + list.items.length, 0);
    return totalListItems <= 10; // Keep short lists together
  }

  // Keep code blocks together
  if (specialContent.codeBlocks.length > 0) {
    return true;
  }

  // Keep diagrams with their captions
  if (specialContent.diagrams.length > 0) {
    return true;
  }

  // Keep technical formats together if they're dense
  if (specialContent.technicalFormats.length > 3) {
    return true;
  }

  // Don't keep regular text together
  const contentLines = content.split('\n').filter((line) => line.trim());
  const hasOnlyRegularText = contentLines.every((line) => {
    return (
      !line.includes('|') && // No tables
      !line.match(/^\s*[•·▪▫▸▹‣⁃\-*+]\s+/) && // No bullets
      !line.match(/^\s*\d+\.\s+/) && // No numbers
      !line.match(/^```/) && // No code blocks
      !line.match(/(?:Figure|Diagram|Chart|Image)\s+\d+/i) && // No diagram refs
      !line.match(/\d+(?:\.\d+)?\s*(?:mm|cm|m|in|ft|kg|lb|°C|°F|Hz|V|A|W|PSI|rpm)/)
    ); // No measurements
  });

  return !hasOnlyRegularText;
}

/**
 * Calculates the token weight for special content types
 */
export function calculateSpecialContentWeight(specialContent: SpecialContentContext): number {
  let weight = 1.0;

  // Only apply weight if there's actual special content
  const hasSpecialContent =
    specialContent.tables.length > 0 ||
    specialContent.lists.length > 0 ||
    specialContent.codeBlocks.length > 0 ||
    specialContent.diagrams.length > 0 ||
    specialContent.technicalFormats.length > 0;

  if (!hasSpecialContent) {
    return 1.0;
  }

  // Tables are more valuable
  if (specialContent.tables.length > 0) {
    weight *= 1.5;
  }

  // Lists with structure are valuable
  if (specialContent.lists.length > 0) {
    weight *= 1.3;
  }

  // Code blocks are critical
  if (specialContent.codeBlocks.length > 0) {
    weight *= 1.8;
  }

  // Diagrams with references are important
  if (specialContent.diagrams.length > 0) {
    weight *= 1.4;
  }

  // Technical formats add value
  if (specialContent.technicalFormats.length > 0) {
    weight *= 1.2;
  }

  return weight;
}
