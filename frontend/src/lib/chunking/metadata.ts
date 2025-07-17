/**
 * Metadata extraction utilities for PDF content
 */

import { PDFContent } from '../types/chunking';

export interface ExtractedMetadata {
  title?: string;
  author?: string;
  subject?: string;
  creator?: string;
  producer?: string;
  creationDate?: Date;
  modificationDate?: Date;
  keywords?: string[];
  pageCount: number;
}

export interface SectionHeader {
  text: string;
  level: number;
  pageNumber: number;
  position: number;
  type: 'heading' | 'title' | 'subtitle' | 'section' | 'subsection';
}

export interface TableOfContents {
  sections: SectionHeader[];
  hierarchy: Map<string, SectionHeader[]>;
}

/**
 * Extracts document-level metadata from PDF content
 */
export function extractDocumentMetadata(
  pdfContent: PDFContent[],
  documentProperties?: Record<string, any>,
): ExtractedMetadata {
  const metadata: ExtractedMetadata = {
    pageCount: pdfContent.length,
  };

  // Extract from document properties if available
  if (documentProperties) {
    metadata.title = documentProperties.Title || documentProperties.title;
    metadata.author = documentProperties.Author || documentProperties.author;
    metadata.subject = documentProperties.Subject || documentProperties.subject;
    metadata.creator = documentProperties.Creator || documentProperties.creator;
    metadata.producer = documentProperties.Producer || documentProperties.producer;

    // Parse dates
    if (documentProperties.CreationDate) {
      metadata.creationDate = new Date(documentProperties.CreationDate);
    }
    if (documentProperties.ModDate) {
      metadata.modificationDate = new Date(documentProperties.ModDate);
    }

    // Parse keywords
    if (documentProperties.Keywords) {
      metadata.keywords = documentProperties.Keywords.split(/[,;]/).map((k: string) => k.trim());
    }
  }

  // If no title in properties, try to extract from first page
  if (!metadata.title && pdfContent.length > 0) {
    metadata.title = extractTitleFromFirstPage(pdfContent[0]);
  }

  return metadata;
}

/**
 * Extracts title from the first page of the document
 */
export function extractTitleFromFirstPage(firstPage: PDFContent): string | undefined {
  const text = firstPage.text;

  // Look for common title patterns
  const titlePatterns = [
    // First line if it's short and capitalized
    /^([A-Z][^\n]{10,80})$/m,
    // Text in all caps
    /^([A-Z\s]{10,80})$/m,
  ];

  for (const pattern of titlePatterns) {
    const match = text.match(pattern);
    if (match) {
      const candidate = match[1].trim();
      // Skip if it looks like a header/footer
      if (!isHeaderFooterLike(candidate)) {
        return candidate;
      }
    }
  }

  return undefined;
}

/**
 * Checks if text looks like a header or footer
 */
function isHeaderFooterLike(text: string): boolean {
  const headerFooterPatterns = [
    /^page\s+\d+/i,
    /^\d+\s*$/,
    /^chapter\s+\d+/i,
    /^section\s+\d+/i,
    /copyright|©|\(c\)/i,
    /confidential|proprietary/i,
  ];

  return headerFooterPatterns.some((pattern) => pattern.test(text));
}

/**
 * Extracts section headers from PDF content
 */
export function extractSectionHeaders(pdfContent: PDFContent[]): SectionHeader[] {
  const headers: SectionHeader[] = [];

  for (const page of pdfContent) {
    const pageHeaders = extractHeadersFromPage(page);
    headers.push(...pageHeaders);
  }

  return headers;
}

/**
 * Extracts headers from a single page
 */
export function extractHeadersFromPage(page: PDFContent): SectionHeader[] {
  const headers: SectionHeader[] = [];
  const lines = page.text.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.length === 0) continue;

    const header = analyzeLineForHeader(line, i, page.pageNumber);
    if (header) {
      headers.push(header);
    }
  }

  return headers;
}

/**
 * Analyzes a line to determine if it's a header
 */
export function analyzeLineForHeader(
  line: string,
  lineIndex: number,
  pageNumber: number,
): SectionHeader | null {
  // Skip very short lines
  if (line.length < 3) return null;

  // Skip lines that look like content
  if (line.length > 100) return null;

  // Check for markdown-style headers
  const markdownMatch = line.match(/^(#{1,6})\s+(.+)$/);
  if (markdownMatch) {
    return {
      text: markdownMatch[2].trim(),
      level: markdownMatch[1].length,
      pageNumber,
      position: lineIndex,
      type: getHeaderType(markdownMatch[1].length),
    };
  }

  // Check for numbered sections
  const numberedMatch = line.match(/^(\d+(?:\.\d+)*)\s+(.+)$/);
  if (numberedMatch) {
    const level = numberedMatch[1].split('.').length;
    return {
      text: numberedMatch[2].trim(),
      level,
      pageNumber,
      position: lineIndex,
      type: getHeaderType(level),
    };
  }

  // Check for numbered sections without period (but also catch numbered with period)
  const numberedMatch2 = line.match(/^(\d+)\.?\s+(.+)$/);
  if (numberedMatch2) {
    return {
      text: numberedMatch2[2].trim(),
      level: 1,
      pageNumber,
      position: lineIndex,
      type: getHeaderType(1),
    };
  }

  // Check for all caps (potential headers)
  if (isAllCapsHeader(line)) {
    return {
      text: line,
      level: 1,
      pageNumber,
      position: lineIndex,
      type: 'heading',
    };
  }

  // Check for title case and formatting patterns
  if (isTitleCaseHeader(line)) {
    return {
      text: line,
      level: 2,
      pageNumber,
      position: lineIndex,
      type: 'section',
    };
  }

  return null;
}

/**
 * Determines if a line is an all-caps header
 */
function isAllCapsHeader(line: string): boolean {
  // Must be mostly uppercase letters
  const upperCount = (line.match(/[A-Z]/g) || []).length;
  const letterCount = (line.match(/[A-Za-z]/g) || []).length;

  return letterCount > 5 && upperCount / letterCount > 0.8 && line.length < 60;
}

/**
 * Determines if a line is a title case header
 */
function isTitleCaseHeader(line: string): boolean {
  // Check for title case pattern
  const words = line.split(/\s+/);
  const titleCaseWords = words.filter(
    (word) =>
      /^[A-Z][a-z]/.test(word) ||
      ['and', 'or', 'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'with'].includes(
        word.toLowerCase(),
      ),
  );

  return words.length >= 2 && titleCaseWords.length / words.length > 0.6 && line.length < 80;
}

/**
 * Maps header level to type
 */
function getHeaderType(level: number): SectionHeader['type'] {
  switch (level) {
    case 1:
      return 'title';
    case 2:
      return 'heading';
    case 3:
      return 'section';
    case 4:
      return 'subsection';
    default:
      return level >= 5 ? 'subsection' : 'heading';
  }
}

/**
 * Builds table of contents from section headers
 */
export function buildTableOfContents(headers: SectionHeader[]): TableOfContents {
  const hierarchy = new Map<string, SectionHeader[]>();

  // Sort headers by page and position
  const sortedHeaders = [...headers].sort((a, b) => {
    if (a.pageNumber !== b.pageNumber) {
      return a.pageNumber - b.pageNumber;
    }
    return a.position - b.position;
  });

  // Build hierarchy
  for (let i = 0; i < sortedHeaders.length; i++) {
    const header = sortedHeaders[i];
    const parentKey = findParentHeader(header, sortedHeaders.slice(0, i));

    if (!hierarchy.has(parentKey)) {
      hierarchy.set(parentKey, []);
    }
    hierarchy.get(parentKey)!.push(header);
  }

  return {
    sections: sortedHeaders,
    hierarchy,
  };
}

/**
 * Finds the parent header for a given header
 */
function findParentHeader(header: SectionHeader, previousHeaders: SectionHeader[]): string {
  // Look for the most recent header with a lower level
  for (let i = previousHeaders.length - 1; i >= 0; i--) {
    const candidate = previousHeaders[i];
    if (candidate.level < header.level) {
      return candidate.text;
    }
  }

  return 'root';
}

/**
 * Extracts page location information
 */
export function extractPageLocation(
  content: string,
  pageNumber: number,
  totalPages: number,
): {
  position: 'top' | 'middle' | 'bottom';
  relativePosition: number;
} {
  // Simple heuristic based on page number
  const relativePosition = pageNumber / totalPages;

  let position: 'top' | 'middle' | 'bottom';
  if (relativePosition < 0.33) {
    position = 'top';
  } else if (relativePosition > 0.66) {
    position = 'bottom';
  } else {
    position = 'middle';
  }

  return {
    position,
    relativePosition,
  };
}

/**
 * Extracts keywords from content
 */
export function extractKeywords(content: string): string[] {
  const keywords: string[] = [];

  // Common technical terms (2-5 uppercase letters)
  const technicalTerms = content.match(/\b[A-Z]{2,5}\b/g) || [];
  keywords.push(...technicalTerms);

  // Numbers with units
  const measurements =
    content.match(/\d+(?:\.\d+)?\s*(?:mm|cm|m|inch|ft|kg|lb|°C|°F|Hz|MHz|GHz|V|A|W|GB|MB|KB)/gi) ||
    [];
  keywords.push(...measurements);

  // Part numbers like A123B
  const partNumbers = content.match(/\b[A-Z]\d+[A-Z]\b/g) || [];
  keywords.push(...partNumbers);

  // Complex part numbers with dashes
  const complexPartNumbers = content.match(/\b[A-Z]\d+[A-Z]-\d+\b/g) || [];
  keywords.push(...complexPartNumbers);

  // Remove duplicates and return
  return [...new Set(keywords)];
}

/**
 * Complete metadata extraction for a document
 */
export function extractCompleteMetadata(
  pdfContent: PDFContent[],
  documentProperties?: Record<string, any>,
): {
  document: ExtractedMetadata;
  headers: SectionHeader[];
  tableOfContents: TableOfContents;
  keywords: string[];
} {
  const document = extractDocumentMetadata(pdfContent, documentProperties);
  const headers = extractSectionHeaders(pdfContent);
  const tableOfContents = buildTableOfContents(headers);

  // Extract keywords from all content
  const allContent = pdfContent.map((page) => page.text).join(' ');
  const keywords = extractKeywords(allContent);

  return {
    document,
    headers,
    tableOfContents,
    keywords,
  };
}
