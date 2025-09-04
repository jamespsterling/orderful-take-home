import { z } from "zod";
import {
  type ConversionRequest,
  ConversionRequestSchema,
  type Document,
  DocumentSchema,
  type StringConversionRequest,
  StringConversionRequestSchema,
  type ValidationResult,
} from "./schemas";

export class ZodValidator {
  validateDocument(document: unknown): ValidationResult<Document> {
    const result = DocumentSchema.safeParse(document);

    if (result.success) {
      return {
        success: true,
        data: result.data,
      };
    }

    return {
      success: false,
      errors: result.error,
    };
  }

  validateConversionRequest(request: unknown): ValidationResult<ConversionRequest> {
    const result = ConversionRequestSchema.safeParse(request);

    if (result.success) {
      return {
        success: true,
        data: result.data,
      };
    }

    return {
      success: false,
      errors: result.error,
    };
  }

  validateStringConversionRequest(request: unknown): ValidationResult<StringConversionRequest> {
    const result = StringConversionRequestSchema.safeParse(request);

    if (result.success) {
      return {
        success: true,
        data: result.data,
      };
    }

    return {
      success: false,
      errors: result.error,
    };
  }

  validateStringDocument(
    content: string,
    segmentSeparator: string,
    elementSeparator: string,
  ): ValidationResult<{ content: string; segmentSeparator: string; elementSeparator: string }> {
    const schema = z
      .object({
        content: z.string().min(1, "Content cannot be empty"),
        segmentSeparator: z.string().min(1, "Segment separator is required"),
        elementSeparator: z.string().min(1, "Element separator is required"),
      })
      .superRefine((data, ctx) => {
        if (data.segmentSeparator === data.elementSeparator) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Segment and element separators must be different",
            path: ["separators"],
          });
        }
        if (!data.content.includes(data.segmentSeparator)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Content must contain at least one segment separator",
            path: ["content"],
          });
        }
        if (!data.content.includes(data.elementSeparator)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Content must contain at least one element separator",
            path: ["content"],
          });
        }
      });

    const result = schema.safeParse({ content, segmentSeparator, elementSeparator });

    if (result.success) {
      return {
        success: true,
        data: result.data,
      };
    }

    return {
      success: false,
      errors: result.error,
    };
  }

  // Helper method to format Zod errors for API responses
  formatErrors(error: z.ZodError): string[] {
    return error.issues.map((err) => {
      const path = err.path.join(".");
      return path ? `${path}: ${err.message}` : err.message;
    });
  }
}
