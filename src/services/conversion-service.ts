import { z } from "zod";
import { DocumentConverter } from "../converters/document-converter";
import type { ConversionRequest, ConversionResponse, Document } from "../types";
import { ZodValidator } from "../validation/zod-validator";

export class ConversionService {
  private converter: DocumentConverter;
  private validator: ZodValidator;

  constructor() {
    this.converter = new DocumentConverter();
    this.validator = new ZodValidator();
  }

  async convertDocument(request: ConversionRequest): Promise<ConversionResponse> {
    try {
      // Validate the request
      const validation = this.validator.validateConversionRequest(request);
      if (!validation.success) {
        return {
          success: false,
          error: `Validation failed: ${this.validator.formatErrors(validation.errors || new z.ZodError([])).join(", ")}`,
        };
      }

      // Perform the conversion
      let result: Document;

      switch (request.targetFormat) {
        case "string": {
          if (request.document.format === "string") {
            // For string to string, we need to specify separators
            throw new Error("Cannot convert string to string without specifying new separators");
          }
          // Use provided separators or defaults for string output
          const segmentSeparator = request.segmentSeparator || "~";
          const elementSeparator = request.elementSeparator || "*";
          result = await this.converter.convertToString(
            request.document,
            segmentSeparator,
            elementSeparator,
          );
          break;
        }

        case "json":
          result = await this.converter.convertToJson(request.document);
          break;

        case "xml":
          result = await this.converter.convertToXml(request.document);
          break;

        default:
          throw new Error(`Unsupported target format: ${request.targetFormat}`);
      }

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown conversion error",
      };
    }
  }

  async convertToString(
    document: Document,
    segmentSeparator: string,
    elementSeparator: string,
  ): Promise<ConversionResponse> {
    try {
      // Validate separators
      const validation = this.validator.validateStringDocument(
        "",
        segmentSeparator,
        elementSeparator,
      );
      if (!validation.success) {
        return {
          success: false,
          error: `Invalid separators: ${this.validator.formatErrors(validation.errors || new z.ZodError([])).join(", ")}`,
        };
      }

      const result = await this.converter.convertToString(
        document,
        segmentSeparator,
        elementSeparator,
      );
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown conversion error",
      };
    }
  }

  async convertToJson(document: Document): Promise<ConversionResponse> {
    try {
      const result = await this.converter.convertToJson(document);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown conversion error",
      };
    }
  }

  async convertToXml(document: Document): Promise<ConversionResponse> {
    try {
      const result = await this.converter.convertToXml(document);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown conversion error",
      };
    }
  }
}
