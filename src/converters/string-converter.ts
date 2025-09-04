import type { ParsedDocument } from "../types";
import type { IStringConverter } from "./interfaces";

export class StringConverter implements IStringConverter {
  parse(content: string, segmentSeparator: string, elementSeparator: string): ParsedDocument {
    if (!content || !segmentSeparator || !elementSeparator) {
      throw new Error("Content and separators are required");
    }

    const segments = content
      .split(segmentSeparator)
      .filter((segment) => segment.trim().length > 0)
      .map((segment) => {
        const elements = segment.split(elementSeparator);
        const segmentName = elements[0];
        const segmentElements = elements.slice(1);

        return {
          name: segmentName,
          elements: segmentElements,
        };
      });

    return { segments };
  }

  serialize(
    parsedDocument: ParsedDocument,
    segmentSeparator: string,
    elementSeparator: string,
  ): string {
    if (!parsedDocument.segments || parsedDocument.segments.length === 0) {
      throw new Error("No segments to serialize");
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
}
