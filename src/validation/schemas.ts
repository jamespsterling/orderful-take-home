import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

// Extend Zod with OpenAPI features
extendZodWithOpenApi(z);

// Base document schema
export const DocumentSchema = z.discriminatedUnion("format", [
  z.object({
    format: z.literal("string"),
    content: z.string().min(1, "Content cannot be empty"),
    segmentSeparator: z.string().min(1, "Segment separator is required"),
    elementSeparator: z.string().min(1, "Element separator is required"),
  }),
  z.object({
    format: z.literal("json"),
    content: z.record(z.string(), z.any()),
  }),
  z.object({
    format: z.literal("xml"),
    content: z.string().min(1, "XML content cannot be empty"),
  }),
]);

// Conversion request schema
export const ConversionRequestSchema = z
  .object({
    document: DocumentSchema,
    targetFormat: z.enum(["string", "json", "xml"]),
    segmentSeparator: z
      .string()
      .min(1, "Segment separator is required when converting to string")
      .optional(),
    elementSeparator: z
      .string()
      .min(1, "Element separator is required when converting to string")
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.document.format === data.targetFormat) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Target format cannot be the same as source format",
        path: ["targetFormat"],
      });
    }

    // Require separators when converting to string
    if (data.targetFormat === "string" && (!data.segmentSeparator || !data.elementSeparator)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Segment and element separators are required when converting to string format",
        path: ["separators"],
      });
    }
  });

// String conversion request schema
export const StringConversionRequestSchema = z
  .object({
    document: DocumentSchema,
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
  });

// Document format type
export type DocumentFormat = z.infer<typeof DocumentSchema>["format"];

// Document type
export type Document = z.infer<typeof DocumentSchema>;

// Conversion request type
export type ConversionRequest = z.infer<typeof ConversionRequestSchema>;

// String conversion request type
export type StringConversionRequest = z.infer<typeof StringConversionRequestSchema>;

// Validation result type
export type ValidationResult<T = Document> = {
  success: boolean;
  data?: T;
  errors?: z.ZodError;
};
