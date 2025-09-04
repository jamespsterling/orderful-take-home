import { beforeEach, describe, expect, it } from "vitest";
import { z } from "zod";
import { ZodValidator } from "../../validation/zod-validator";

describe("ZodValidator", () => {
  let validator: ZodValidator;

  beforeEach(() => {
    validator = new ZodValidator();
  });

  describe("validateDocument", () => {
    it("should validate a valid string document", () => {
      const document = {
        format: "string",
        content: "ISA*00*          *00*          *12*5032337522",
        segmentSeparator: "~",
        elementSeparator: "*",
      };

      const result = validator.validateDocument(document);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(document);
    });

    it("should validate a valid JSON document", () => {
      const document = {
        format: "json",
        content: {
          ISA: [
            {
              ISA1: "00",
              ISA2: "          ",
              ISA3: "00",
              ISA4: "          ",
              ISA5: "12",
              ISA6: "5032337522",
            },
          ],
        },
      };

      const result = validator.validateDocument(document);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(document);
    });

    it("should validate a valid XML document", () => {
      const document = {
        format: "xml",
        content: '<?xml version="1.0" encoding="UTF-8" ?><root><ISA><ISA1>00</ISA1></ISA></root>',
      };

      const result = validator.validateDocument(document);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(document);
    });

    it("should reject document with invalid format", () => {
      const document = {
        format: "invalid",
        content: "some content",
      };

      const result = validator.validateDocument(document);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it("should reject string document without separators", () => {
      const document = {
        format: "string",
        content: "ISA*00*          *00*          *12*5032337522",
        // Missing segmentSeparator and elementSeparator
      };

      const result = validator.validateDocument(document);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it("should reject empty content", () => {
      const document = {
        format: "string",
        content: "",
        segmentSeparator: "~",
        elementSeparator: "*",
      };

      const result = validator.validateDocument(document);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe("validateConversionRequest", () => {
    it("should validate a valid conversion request", () => {
      const request = {
        document: {
          format: "string",
          content: "ISA*00*          *00*          *12*5032337522",
          segmentSeparator: "~",
          elementSeparator: "*",
        },
        targetFormat: "json",
      };

      const result = validator.validateConversionRequest(request);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(request);
    });

    it("should validate conversion request with separators for string target", () => {
      const request = {
        document: {
          format: "json",
          content: { ISA: [{ ISA1: "00" }] },
        },
        targetFormat: "string",
        segmentSeparator: "~",
        elementSeparator: "*",
      };

      const result = validator.validateConversionRequest(request);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(request);
    });

    it("should reject conversion to same format", () => {
      const request = {
        document: {
          format: "string",
          content: "ISA*00*          *00*          *12*5032337522",
          segmentSeparator: "~",
          elementSeparator: "*",
        },
        targetFormat: "string",
      };

      const result = validator.validateConversionRequest(request);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it("should reject string conversion without separators", () => {
      const request = {
        document: {
          format: "json",
          content: { ISA: [{ ISA1: "00" }] },
        },
        targetFormat: "string",
        // Missing separators
      };

      const result = validator.validateConversionRequest(request);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it("should reject request with invalid target format", () => {
      const request = {
        document: {
          format: "string",
          content: "ISA*00*          *00*          *12*5032337522",
          segmentSeparator: "~",
          elementSeparator: "*",
        },
        targetFormat: "invalid",
      };

      const result = validator.validateConversionRequest(request);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe("validateStringConversionRequest", () => {
    it("should validate a valid string conversion request", () => {
      const request = {
        document: {
          format: "json",
          content: { ISA: [{ ISA1: "00" }] },
        },
        segmentSeparator: "~",
        elementSeparator: "*",
      };

      const result = validator.validateStringConversionRequest(request);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(request);
    });

    it("should reject request with same separators", () => {
      const request = {
        document: {
          format: "json",
          content: { ISA: [{ ISA1: "00" }] },
        },
        segmentSeparator: "~",
        elementSeparator: "~", // Same as segment separator
      };

      const result = validator.validateStringConversionRequest(request);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it("should reject request with empty separators", () => {
      const request = {
        document: {
          format: "json",
          content: { ISA: [{ ISA1: "00" }] },
        },
        segmentSeparator: "",
        elementSeparator: "*",
      };

      const result = validator.validateStringConversionRequest(request);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe("validateStringDocument", () => {
    it("should validate valid string document with separators", () => {
      const result = validator.validateStringDocument(
        "ISA*00*          *00*          *12*5032337522~",
        "~",
        "*",
      );
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it("should reject empty content", () => {
      const result = validator.validateStringDocument("", "~", "*");
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it("should reject empty segment separator", () => {
      const result = validator.validateStringDocument(
        "ISA*00*          *00*          *12*5032337522",
        "",
        "*",
      );
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it("should reject empty element separator", () => {
      const result = validator.validateStringDocument(
        "ISA*00*          *00*          *12*5032337522",
        "~",
        "",
      );
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it("should reject same separators", () => {
      const result = validator.validateStringDocument(
        "ISA*00*          *00*          *12*5032337522",
        "~",
        "~",
      );
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe("formatErrors", () => {
    it("should format validation errors correctly", () => {
      // Create a simple ZodError with basic properties
      const zodError = new z.ZodError([
        {
          code: "custom",
          path: ["content"],
          message: "Expected string, received number",
        },
        {
          code: "custom",
          path: ["segmentSeparator"],
          message: "String must contain at least 1 character(s)",
        },
      ]);

      const formattedErrors = validator.formatErrors(zodError);
      expect(formattedErrors).toHaveLength(2);
      expect(formattedErrors[0]).toContain("Expected string, received number");
      expect(formattedErrors[1]).toContain("String must contain at least 1 character(s)");
    });

    it("should handle empty error array", () => {
      const zodError = new z.ZodError([]);
      const formattedErrors = validator.formatErrors(zodError);
      expect(formattedErrors).toHaveLength(0);
    });
  });

  describe("edge cases", () => {
    it("should handle very long content", () => {
      const longContent = "A".repeat(10000);
      const document = {
        format: "string",
        content: longContent,
        segmentSeparator: "~",
        elementSeparator: "*",
      };

      const result = validator.validateDocument(document);
      expect(result.success).toBe(true);
    });

    it("should handle special characters in separators", () => {
      const document = {
        format: "string",
        content: "ISA|00|          |00|          |12|5032337522",
        segmentSeparator: "~",
        elementSeparator: "|",
      };

      const result = validator.validateDocument(document);
      expect(result.success).toBe(true);
    });

    it("should handle unicode content", () => {
      const document = {
        format: "string",
        content: "ISA*00*测试*00*测试*12*5032337522",
        segmentSeparator: "~",
        elementSeparator: "*",
      };

      const result = validator.validateDocument(document);
      expect(result.success).toBe(true);
    });
  });
});
