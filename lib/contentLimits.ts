import { APP_LIMITS, ERROR_MESSAGES } from "./limits";

export interface ContentCheckResult {
  isValid: boolean;
  wordCount: number;
  charCount: number;
  error?: string;
}

export function checkDocumentContent(content: string): ContentCheckResult {
  // Remove HTML tags and get plain text
  const plainText = content.replace(/<[^>]*>/g, '');
  
  // Count words (split by whitespace and filter out empty strings)
  const words = plainText.trim().split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;
  
  // Count characters
  const charCount = plainText.length;
  
  // Check limits
  if (wordCount > APP_LIMITS.MAX_WORDS_PER_DOC) {
    return {
      isValid: false,
      wordCount,
      charCount,
      error: ERROR_MESSAGES.MAX_WORDS_EXCEEDED
    };
  }
  
  if (charCount > APP_LIMITS.MAX_CHARS_PER_DOC) {
    return {
      isValid: false,
      wordCount,
      charCount,
      error: ERROR_MESSAGES.MAX_CHARS_EXCEEDED
    };
  }
  
  return {
    isValid: true,
    wordCount,
    charCount
  };
}

export function getContentStats(content: string): { wordCount: number; charCount: number } {
  const plainText = content.replace(/<[^>]*>/g, '');
  const words = plainText.trim().split(/\s+/).filter(word => word.length > 0);
  
  return {
    wordCount: words.length,
    charCount: plainText.length
  };
}

export function formatContentStats(wordCount: number, charCount: number): string {
  return `${wordCount} words, ${charCount.toLocaleString()} characters`;
}
