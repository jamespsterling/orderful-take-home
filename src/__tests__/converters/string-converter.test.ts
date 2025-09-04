import { beforeEach, describe, expect, it } from "vitest";
import { StringConverter } from "../../converters/string-converter";
import type { ParsedDocument } from "../../types";

describe("StringConverter", () => {
  let converter: StringConverter;

  beforeEach(() => {
    converter = new StringConverter();
  });

  describe("parse", () => {
    it("should parse a simple string document correctly", () => {
      const content = "ProductID*4*8*15*16*23~ProductID*a*b*c*d*e~";
      const result = converter.parse(content, "~", "*");

      expect(result.segments).toHaveLength(2);
      expect(result.segments[0]).toEqual({
        name: "ProductID",
        elements: ["4", "8", "15", "16", "23"],
      });
      expect(result.segments[1]).toEqual({
        name: "ProductID",
        elements: ["a", "b", "c", "d", "e"],
      });
    });

    it("should handle empty segments", () => {
      const content = "ProductID*4*8*15*16*23~~ProductID*a*b*c*d*e~";
      const result = converter.parse(content, "~", "*");

      expect(result.segments).toHaveLength(2);
      expect(result.segments[0]).toEqual({
        name: "ProductID",
        elements: ["4", "8", "15", "16", "23"],
      });
      expect(result.segments[1]).toEqual({
        name: "ProductID",
        elements: ["a", "b", "c", "d", "e"],
      });
    });

    it("should handle segments with empty elements", () => {
      const content = "ProductID*4**8*15*16*23~";
      const result = converter.parse(content, "~", "*");

      expect(result.segments).toHaveLength(1);
      expect(result.segments[0]).toEqual({
        name: "ProductID",
        elements: ["4", "", "8", "15", "16", "23"],
      });
    });

    it("should throw error for missing content", () => {
      expect(() => converter.parse("", "~", "*")).toThrow("Content and separators are required");
    });

    it("should throw error for missing segment separator", () => {
      expect(() => converter.parse("content", "", "*")).toThrow(
        "Content and separators are required",
      );
    });

    it("should throw error for missing element separator", () => {
      expect(() => converter.parse("content", "~", "")).toThrow(
        "Content and separators are required",
      );
    });

    it("should handle different separator characters", () => {
      const content = "ProductID|4|8|15|16|23#ProductID|a|b|c|d|e#";
      const result = converter.parse(content, "#", "|");

      expect(result.segments).toHaveLength(2);
      expect(result.segments[0]).toEqual({
        name: "ProductID",
        elements: ["4", "8", "15", "16", "23"],
      });
      expect(result.segments[1]).toEqual({
        name: "ProductID",
        elements: ["a", "b", "c", "d", "e"],
      });
    });
  });

  describe("serialize", () => {
    it("should serialize a parsed document back to string", () => {
      const parsedDocument: ParsedDocument = {
        segments: [
          { name: "ProductID", elements: ["4", "8", "15", "16", "23"] },
          { name: "ProductID", elements: ["a", "b", "c", "d", "e"] },
        ],
      };

      const result = converter.serialize(parsedDocument, "~", "*");
      expect(result).toBe("ProductID*4*8*15*16*23~ProductID*a*b*c*d*e~");
    });

    it("should handle segments with empty elements", () => {
      const parsedDocument: ParsedDocument = {
        segments: [{ name: "ProductID", elements: ["4", "", "8", "15", "16", "23"] }],
      };

      const result = converter.serialize(parsedDocument, "~", "*");
      expect(result).toBe("ProductID*4**8*15*16*23~");
    });

    it("should throw error for empty segments", () => {
      const parsedDocument: ParsedDocument = { segments: [] };
      expect(() => converter.serialize(parsedDocument, "~", "*")).toThrow(
        "No segments to serialize",
      );
    });

    it("should handle different separator characters", () => {
      const parsedDocument: ParsedDocument = {
        segments: [
          { name: "ProductID", elements: ["4", "8", "15", "16", "23"] },
          { name: "ProductID", elements: ["a", "b", "c", "d", "e"] },
        ],
      };

      const result = converter.serialize(parsedDocument, "#", "|");
      expect(result).toBe("ProductID|4|8|15|16|23#ProductID|a|b|c|d|e#");
    });
  });

  describe("round-trip conversion", () => {
    it("should maintain data integrity through parse and serialize", () => {
      const originalContent = "ProductID*4*8*15*16*23~ProductID*a*b*c*d*e~AddressID*42*108*3*14~";
      const parsed = converter.parse(originalContent, "~", "*");
      const serialized = converter.serialize(parsed, "~", "*");

      expect(serialized).toBe(originalContent);
    });

    it("should handle complex EDI data", () => {
      const ediContent =
        "ISA*00*          *00*          *12*5032337522     *01*048337914      *190225*1532*^*00501*000001367*0*P*>~GS*PO*SENDER*RECEIVER*20190325*1532*572*X*005010~";
      const parsed = converter.parse(ediContent, "~", "*");
      const serialized = converter.serialize(parsed, "~", "*");

      expect(serialized).toBe(ediContent);
    });
  });
});
