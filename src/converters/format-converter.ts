import type { ParsedDocument } from "../types";
import type { IFormatConverter } from "./interfaces";

export class FormatConverter implements IFormatConverter {
  convertToString(
    parsedDocument: ParsedDocument,
    segmentSeparator: string,
    elementSeparator: string,
  ): string {
    if (!parsedDocument.segments || parsedDocument.segments.length === 0) {
      throw new Error("No segments to convert");
    }

    const segmentsString = parsedDocument.segments
      .map((segment) => {
        const elements = [segment.name, ...segment.elements];
        return elements.join(elementSeparator);
      })
      .join(segmentSeparator);

    // Add final segment separator for EDI X12 compliance
    return segmentsString + segmentSeparator;
  }

  convertToJson(parsedDocument: ParsedDocument): Record<string, Array<Record<string, string>>> {
    if (!parsedDocument.segments || parsedDocument.segments.length === 0) {
      throw new Error("No segments to convert");
    }

    const result: Record<string, Array<Record<string, string>>> = {};

    parsedDocument.segments.forEach((segment) => {
      if (!result[segment.name]) {
        result[segment.name] = [];
      }

      const segmentObject: Record<string, string> = {};
      segment.elements.forEach((element, index) => {
        segmentObject[`${segment.name}${index + 1}`] = element;
      });

      result[segment.name].push(segmentObject);
    });

    return result;
  }

  convertToXml(parsedDocument: ParsedDocument): string {
    if (!parsedDocument.segments || parsedDocument.segments.length === 0) {
      throw new Error("No segments to convert");
    }

    let xml = '<?xml version="1.0" encoding="UTF-8" ?>\n<root>\n';

    parsedDocument.segments.forEach((segment) => {
      xml += `  <${segment.name}>\n`;
      segment.elements.forEach((element, index) => {
        xml += `    <${segment.name}${index + 1}>${this.escapeXml(element)}</${segment.name}${index + 1}>\n`;
      });
      xml += `  </${segment.name}>\n`;
    });

    xml += "</root>";
    return xml;
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }
}
