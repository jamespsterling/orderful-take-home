// Re-export types from Zod schemas
export type { ConversionRequest, DocumentFormat } from "../validation/schemas";

// Define Document type locally to avoid circular dependency
export type Document = StringDocument | JsonDocument | XmlDocument;

// Additional types that aren't in the schemas
export interface StringDocument {
  format: "string";
  content: string;
  segmentSeparator: string;
  elementSeparator: string;
}

export interface JsonDocument {
  format: "json";
  content: Record<string, Array<Record<string, string>>>;
}

export interface XmlDocument {
  format: "xml";
  content: string;
}

export interface ConversionResponse {
  success: boolean;
  data?: Document;
  error?: string;
}

export interface Segment {
  name: string;
  elements: string[];
}

export interface ParsedDocument {
  segments: Segment[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}
