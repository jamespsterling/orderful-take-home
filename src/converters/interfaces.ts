import type { Document, ParsedDocument } from "../types";

export interface IConverter {
  canConvert(from: Document, to: string): boolean;
  convert(document: Document): Promise<Document>;
}

export interface IStringConverter {
  parse(content: string, segmentSeparator: string, elementSeparator: string): ParsedDocument;
  serialize(
    parsedDocument: ParsedDocument,
    segmentSeparator: string,
    elementSeparator: string,
  ): string;
}

export interface IFormatConverter {
  convertToString(
    parsedDocument: ParsedDocument,
    segmentSeparator: string,
    elementSeparator: string,
  ): string;
  convertToJson(parsedDocument: ParsedDocument): Record<string, Array<Record<string, string>>>;
  convertToXml(parsedDocument: ParsedDocument): string;
}
