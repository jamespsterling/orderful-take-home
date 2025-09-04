import * as xml2js from "xml2js";
import type {
  Document,
  DocumentFormat,
  JsonDocument,
  ParsedDocument,
  StringDocument,
  XmlDocument,
} from "../types";
import { FormatConverter } from "./format-converter";
import type { IConverter } from "./interfaces";
import { StringConverter } from "./string-converter";

// Type guard functions
function isStringDocument(document: Document): document is StringDocument {
  return document.format === "string";
}

function isJsonDocument(document: Document): document is JsonDocument {
  return document.format === "json";
}

function isXmlDocument(document: Document): document is XmlDocument {
  return document.format === "xml";
}

function isValidDocumentFormat(format: string): format is DocumentFormat {
  return ["string", "json", "xml"].includes(format);
}

export class DocumentConverter implements IConverter {
  private stringConverter: StringConverter;
  private formatConverter: FormatConverter;

  constructor() {
    this.stringConverter = new StringConverter();
    this.formatConverter = new FormatConverter();
  }

  canConvert(from: Document, to: string): boolean {
    return isValidDocumentFormat(from.format) && isValidDocumentFormat(to);
  }

  async convert(document: Document): Promise<Document> {
    try {
      // First, parse the input document to get a common format
      const parsedDocument = await this.parseInputDocument(document);

      // Then convert to the target format
      if (isStringDocument(document)) {
        return this.convertFromString(document, parsedDocument);
      } else if (isJsonDocument(document)) {
        return this.convertFromJson(document, parsedDocument);
      } else if (isXmlDocument(document)) {
        return this.convertFromXml(document, parsedDocument);
      } else {
        throw new Error(`Unsupported input format: ${(document as { format: string }).format}`);
      }
    } catch (error) {
      throw new Error(
        `Conversion failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  private async parseInputDocument(document: Document): Promise<ParsedDocument> {
    if (isStringDocument(document)) {
      return this.stringConverter.parse(
        document.content,
        document.segmentSeparator,
        document.elementSeparator,
      );
    } else if (isJsonDocument(document)) {
      return this.parseJsonDocument(document);
    } else if (isXmlDocument(document)) {
      return await this.parseXmlDocument(document);
    } else {
      throw new Error(`Unsupported input format: ${(document as { format: string }).format}`);
    }
  }

  private parseJsonDocument(jsonDoc: JsonDocument): ParsedDocument {
    const segments: Array<{ name: string; elements: string[] }> = [];

    for (const [segmentName, segmentArray] of Object.entries(jsonDoc.content)) {
      for (const segmentObject of segmentArray) {
        const elements: string[] = [];

        // Extract the segment name prefix (e.g., "PO1" from "PO11")
        const prefix = segmentName;

        // Find the maximum element number for this segment
        const elementKeys = Object.keys(segmentObject).filter((key) => key.startsWith(prefix));
        const maxElementNum = Math.max(
          ...elementKeys.map((key) => {
            const num = parseInt(key.substring(prefix.length), 10);
            return Number.isNaN(num) ? 0 : num;
          }),
        );

        // Reconstruct elements in order (1 to maxElementNum)
        for (let i = 1; i <= maxElementNum; i++) {
          const key = `${prefix}${i}`;
          elements.push(segmentObject[key] || "");
        }

        segments.push({ name: segmentName, elements });
      }
    }

    return { segments };
  }

  private async parseXmlDocument(xmlDoc: XmlDocument): Promise<ParsedDocument> {
    try {
      const parser = new xml2js.Parser({ explicitArray: false });
      const result = await parser.parseStringPromise(xmlDoc.content);

      if (!result.root) {
        throw new Error("Invalid XML structure: missing root element");
      }

      const segments: Array<{ name: string; elements: string[] }> = [];
      const root = result.root;

      for (const segmentName of Object.keys(root)) {
        if (segmentName !== "$") {
          const segmentArray = Array.isArray(root[segmentName])
            ? root[segmentName]
            : [root[segmentName]];

          for (const segment of segmentArray) {
            const elements: string[] = [];
            for (const key of Object.keys(segment)
              .filter((key) => key !== "$")
              .sort()) {
              elements.push(segment[key]);
            }
            segments.push({ name: segmentName, elements });
          }
        }
      }

      return { segments };
    } catch (error) {
      throw new Error(
        `Failed to parse XML: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  private convertFromString(_stringDoc: StringDocument, _parsedDocument: ParsedDocument): Document {
    // For string input, we need to determine the target format from the context
    // This would typically come from the request
    throw new Error("Target format must be specified for string input conversion");
  }

  private convertFromJson(_jsonDoc: JsonDocument, _parsedDocument: ParsedDocument): Document {
    // For JSON input, we need to determine the target format from the context
    // This would typically come from the request
    throw new Error("Target format must be specified for JSON input conversion");
  }

  private convertFromXml(_xmlDoc: XmlDocument, _parsedDocument: ParsedDocument): Document {
    // For XML input, we need to determine the target format from the context
    // This would typically come from the request
    throw new Error("Target format must be specified for XML input conversion");
  }

  // Public methods for specific conversions
  async convertToString(
    document: Document,
    segmentSeparator: string,
    elementSeparator: string,
  ): Promise<StringDocument> {
    const parsedDocument = await this.parseInputDocument(document);
    const content = this.formatConverter.convertToString(
      parsedDocument,
      segmentSeparator,
      elementSeparator,
    );

    return {
      format: "string",
      content,
      segmentSeparator,
      elementSeparator,
    };
  }

  async convertToJson(document: Document): Promise<JsonDocument> {
    const parsedDocument = await this.parseInputDocument(document);
    const content = this.formatConverter.convertToJson(parsedDocument);

    return {
      format: "json",
      content,
    };
  }

  async convertToXml(document: Document): Promise<XmlDocument> {
    const parsedDocument = await this.parseInputDocument(document);
    const content = this.formatConverter.convertToXml(parsedDocument);

    return {
      format: "xml",
      content,
    };
  }
}
