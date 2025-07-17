/**
 * Text preprocessing and cleaning utilities for optimal embedding quality
 */

export interface TextCleaningOptions {
  normalizeWhitespace: boolean;
  removeExtraLineBreaks: boolean;
  normalizeUnicode: boolean;
  fixEncodingIssues: boolean;
  preserveStructure: boolean;
  removeNonPrintable: boolean;
  normalizeQuotes: boolean;
  normalizeDashes: boolean;
  preserveSpecialContent: boolean;
}

export interface NormalizedText {
  content: string;
  originalLength: number;
  normalizedLength: number;
  transformations: string[];
  preservedElements: PreservedElement[];
}

export interface PreservedElement {
  type: 'table' | 'list' | 'code' | 'formula' | 'diagram';
  originalText: string;
  normalizedText: string;
  position: number;
  length: number;
}

export const DEFAULT_CLEANING_OPTIONS: TextCleaningOptions = {
  normalizeWhitespace: true,
  removeExtraLineBreaks: true,
  normalizeUnicode: true,
  fixEncodingIssues: true,
  preserveStructure: true,
  removeNonPrintable: true,
  normalizeQuotes: true,
  normalizeDashes: true,
  preserveSpecialContent: true,
};

/**
 * Main text preprocessing function
 */
export function preprocessText(
  text: string,
  options: Partial<TextCleaningOptions> = {},
): NormalizedText {
  const opts = { ...DEFAULT_CLEANING_OPTIONS, ...options };
  let content = text;
  const transformations: string[] = [];
  const preservedElements: PreservedElement[] = [];
  const originalLength = text.length;

  // Step 1: Preserve special content before cleaning
  if (opts.preserveSpecialContent) {
    ({ content, preservedElements } = preserveSpecialContent(content));
    if (preservedElements.length > 0) {
      transformations.push(`Preserved ${preservedElements.length} special content elements`);
    }
  }

  // Step 2: Fix encoding issues
  if (opts.fixEncodingIssues) {
    const fixed = fixEncodingIssues(content);
    if (fixed !== content) {
      content = fixed;
      transformations.push('Fixed encoding issues');
    }
  }

  // Step 3: Normalize Unicode
  if (opts.normalizeUnicode) {
    const normalized = normalizeUnicode(content);
    if (normalized !== content) {
      content = normalized;
      transformations.push('Normalized Unicode characters');
    }
  }

  // Step 4: Remove non-printable characters
  if (opts.removeNonPrintable) {
    const cleaned = removeNonPrintableCharacters(content);
    if (cleaned !== content) {
      content = cleaned;
      transformations.push('Removed non-printable characters');
    }
  }

  // Step 5: Normalize quotes and dashes
  if (opts.normalizeQuotes) {
    const normalized = normalizeQuotes(content);
    if (normalized !== content) {
      content = normalized;
      transformations.push('Normalized quotes');
    }
  }

  if (opts.normalizeDashes) {
    const normalized = normalizeDashes(content);
    if (normalized !== content) {
      content = normalized;
      transformations.push('Normalized dashes');
    }
  }

  // Step 6: Normalize whitespace
  if (opts.normalizeWhitespace) {
    const normalized = normalizeWhitespace(content);
    if (normalized !== content) {
      content = normalized;
      transformations.push('Normalized whitespace');
    }
  }

  // Step 7: Remove extra line breaks
  if (opts.removeExtraLineBreaks) {
    const cleaned = removeExtraLineBreaks(content);
    if (cleaned !== content) {
      content = cleaned;
      transformations.push('Removed extra line breaks');
    }
  }

  // Step 8: Restore preserved special content
  if (opts.preserveSpecialContent && preservedElements.length > 0) {
    content = restoreSpecialContent(content, preservedElements);
    transformations.push('Restored preserved special content');
  }

  return {
    content,
    originalLength,
    normalizedLength: content.length,
    transformations,
    preservedElements,
  };
}

/**
 * Preserves special content before cleaning
 */
function preserveSpecialContent(text: string): {
  content: string;
  preservedElements: PreservedElement[];
} {
  const preservedElements: PreservedElement[] = [];
  let content = text;
  let placeholderIndex = 0;

  // Preserve tables
  const tablePattern = /(\|[^|\n]*\|[^|\n]*\|[^\n]*\n)+/g;
  content = content.replace(tablePattern, (match, offset) => {
    const placeholder = `__TABLE_PLACEHOLDER_${placeholderIndex++}__`;
    preservedElements.push({
      type: 'table',
      originalText: match,
      normalizedText: placeholder,
      position: offset,
      length: match.length,
    });
    return placeholder;
  });

  // Preserve code blocks
  const codeBlockPattern = /```[\s\S]*?```/g;
  content = content.replace(codeBlockPattern, (match, offset) => {
    const placeholder = `__CODE_PLACEHOLDER_${placeholderIndex++}__`;
    preservedElements.push({
      type: 'code',
      originalText: match,
      normalizedText: placeholder,
      position: offset,
      length: match.length,
    });
    return placeholder;
  });

  // Preserve formulas
  const formulaPattern = /\b[A-Z]\s*=\s*[A-Z0-9\+\-\*\/\(\)\s]+/g;
  content = content.replace(formulaPattern, (match, offset) => {
    const placeholder = `__FORMULA_PLACEHOLDER_${placeholderIndex++}__`;
    preservedElements.push({
      type: 'formula',
      originalText: match,
      normalizedText: placeholder,
      position: offset,
      length: match.length,
    });
    return placeholder;
  });

  // Preserve diagram references
  const diagramPattern = /(?:Figure|Diagram|Chart|Image)\s+\d+(?:\.\d+)?[:\s]?[^\n]*/gi;
  content = content.replace(diagramPattern, (match, offset) => {
    const placeholder = `__DIAGRAM_PLACEHOLDER_${placeholderIndex++}__`;
    preservedElements.push({
      type: 'diagram',
      originalText: match,
      normalizedText: placeholder,
      position: offset,
      length: match.length,
    });
    return placeholder;
  });

  return { content, preservedElements };
}

/**
 * Restores preserved special content after cleaning
 */
function restoreSpecialContent(text: string, preservedElements: PreservedElement[]): string {
  let content = text;

  // Restore in reverse order to maintain positions
  for (let i = preservedElements.length - 1; i >= 0; i--) {
    const element = preservedElements[i];
    content = content.replace(element.normalizedText, element.originalText);
  }

  return content;
}

/**
 * Fixes common encoding issues
 */
function fixEncodingIssues(text: string): string {
  const encodingFixes = [
    // Windows-1252 to UTF-8 common issues
    [/â€™/g, "'"], // Right single quotation mark
    [/â€œ/g, '"'], // Left double quotation mark
    [/â€\u009D/g, '"'], // Right double quotation mark
    [/â€"/g, '—'], // Em dash
    [/â€"/g, '–'], // En dash
    [/Â/g, ' '], // Non-breaking space
    [/Ã©/g, 'é'], // e with acute accent
    [/Ã¡/g, 'á'], // a with acute accent
    [/Ã­/g, 'í'], // i with acute accent
    [/Ã³/g, 'ó'], // o with acute accent
    [/Ãº/g, 'ú'], // u with acute accent
    [/Ã±/g, 'ñ'], // n with tilde
    [/Â°/g, '°'], // Degree symbol
    [/Â±/g, '±'], // Plus-minus sign
    [/Â²/g, '²'], // Superscript two
    [/Â³/g, '³'], // Superscript three
    [/Â¼/g, '¼'], // Fraction one quarter
    [/Â½/g, '½'], // Fraction one half
    [/Â¾/g, '¾'], // Fraction three quarters
  ];

  let result = text;
  for (const [pattern, replacement] of encodingFixes) {
    result = result.replace(pattern, replacement);
  }

  return result;
}

/**
 * Normalizes Unicode characters
 */
function normalizeUnicode(text: string): string {
  // Use Unicode normalization form NFC (Canonical Decomposition, followed by Canonical Composition)
  return text.normalize('NFC');
}

/**
 * Removes non-printable characters
 */
function removeNonPrintableCharacters(text: string): string {
  // Remove control characters except tab, newline, and carriage return
  return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '');
}

/**
 * Normalizes quotes to standard forms
 */
function normalizeQuotes(text: string): string {
  return (
    text
      // Left and right single quotes to straight single quote
      .replace(/[\u2018\u2019]/g, "'")
      // Left and right double quotes to straight double quote
      .replace(/[\u201C\u201D]/g, '"')
      // Other quote variations
      .replace(/[\u2039\u203A]/g, "'")
      .replace(/[\u00AB\u00BB]/g, '"')
  );
}

/**
 * Normalizes dashes to standard forms
 */
function normalizeDashes(text: string): string {
  return (
    text
      // Em dash and en dash to hyphen in most contexts
      .replace(/[\u2013\u2014]/g, '-')
      // Minus sign to hyphen
      .replace(/[\u2212]/g, '-')
      // Figure dash to hyphen
      .replace(/[\u2012]/g, '-')
  );
}

/**
 * Normalizes whitespace characters
 */
function normalizeWhitespace(text: string): string {
  return (
    text
      // Replace all whitespace variations with regular space
      .replace(/[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g, ' ')
      // Replace tabs with spaces
      .replace(/\t/g, ' ')
      // Collapse multiple spaces into single space
      .replace(/ {2,}/g, ' ')
      // Trim whitespace from beginning and end of lines
      .replace(/^ +| +$/gm, '')
  );
}

/**
 * Removes extra line breaks
 */
function removeExtraLineBreaks(text: string): string {
  return (
    text
      // Replace 3+ consecutive line breaks with 2
      .replace(/\n{3,}/g, '\n\n')
      // Replace Windows-style line endings with Unix-style
      .replace(/\r\n/g, '\n')
      // Remove standalone carriage returns
      .replace(/\r/g, '')
  );
}

/**
 * Cleans text specifically for embedding optimization
 */
export function cleanForEmbedding(text: string): string {
  const cleaned = preprocessText(text, {
    normalizeWhitespace: true,
    removeExtraLineBreaks: true,
    normalizeUnicode: true,
    fixEncodingIssues: true,
    preserveStructure: true,
    removeNonPrintable: true,
    normalizeQuotes: true,
    normalizeDashes: true,
    preserveSpecialContent: true,
  });

  return cleaned.content;
}

/**
 * Validates text quality after preprocessing
 */
export function validateTextQuality(
  original: string,
  processed: string,
): {
  isValid: boolean;
  issues: string[];
  qualityScore: number;
} {
  const issues: string[] = [];
  let qualityScore = 100;

  // Check for excessive content loss
  const contentLossRatio = (original.length - processed.length) / original.length;
  if (contentLossRatio > 0.5) {
    issues.push('Excessive content loss (>50%)');
    qualityScore -= 30;
  } else if (contentLossRatio > 0.2) {
    issues.push('Significant content loss (>20%)');
    qualityScore -= 15;
  }

  // Check for broken structures
  const originalTables = (original.match(/\|[^|\n]*\|/g) || []).length;
  const processedTables = (processed.match(/\|[^|\n]*\|/g) || []).length;
  if (originalTables > 0 && processedTables < originalTables * 0.8) {
    issues.push('Table structure degradation');
    qualityScore -= 20;
  }

  // Check for malformed text
  if (processed.includes('undefined') || processed.includes('null')) {
    issues.push('Contains undefined/null values');
    qualityScore -= 25;
  }

  // Check for encoding issues
  if (/[^\x00-\x7F]/.test(processed) && !/[À-ÿ]/.test(processed)) {
    issues.push('Potential encoding issues remain');
    qualityScore -= 10;
  }

  // Check for excessive repetition
  const repetitionPattern = /(.{10,})\1{2,}/g;
  if (repetitionPattern.test(processed)) {
    issues.push('Excessive content repetition detected');
    qualityScore -= 15;
  }

  return {
    isValid: issues.length === 0,
    issues,
    qualityScore: Math.max(0, qualityScore),
  };
}
