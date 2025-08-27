// Application-wide limits and restrictions
export const APP_LIMITS = {
  // Document sharing limits
  MAX_USERS_PER_DOC: 5, // Including owner, so 4 additional users can be invited
  
  // User document creation limits
  MAX_DOCS_PER_USER: 5,
  
  // Document content limits
  MAX_WORDS_PER_DOC: 5000,
  MAX_CHARS_PER_DOC: 20000, // Roughly 5 words per character
  
  // Title limits
  MAX_TITLE_LENGTH: 100, // characters
  MIN_TITLE_LENGTH: 1,
  
  // API usage limits (for tracking)
  MAX_AI_CHAT_PER_DAY: 10,
  MAX_TRANSLATION_PER_DAY: 5,
};

export const ERROR_MESSAGES = {
  MAX_USERS_EXCEEDED: "Maximum 5 users allowed per document (including owner).",
  MAX_DOCS_EXCEEDED: "You can only create up to 5 documents. Please delete some documents to create new ones.",
  MAX_WORDS_EXCEEDED: "Document content exceeds 5000 words limit. Please reduce the content.",
  MAX_CHARS_EXCEEDED: "Document content is too long. Please reduce the content.",
  TITLE_TOO_LONG: "Title is too long. Maximum 100 characters allowed.",
  TITLE_TOO_SHORT: "Title cannot be empty.",
  DOCUMENT_TOO_LARGE: "Document is too large. Please reduce the content size.",
};
