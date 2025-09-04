import { beforeEach, describe, expect, it } from "vitest";
import { FormatConverter } from "../../converters/format-converter";
import type { ParsedDocument } from "../../types";

describe("FormatConverter", () => {
  let converter: FormatConverter;

  beforeEach(() => {
    converter = new FormatConverter();
  });

  describe("convertToString", () => {
    it("should convert parsed document to string format", () => {
      const parsedDocument: ParsedDocument = {
        segments: [
          { name: "ProductID", elements: ["4", "8", "15", "16", "23"] },
          { name: "ProductID", elements: ["a", "b", "c", "d", "e"] },
          { name: "AddressID", elements: ["42", "108", "3", "14"] },
        ],
      };

      const result = converter.convertToString(parsedDocument, "~", "*");
      expect(result).toBe("ProductID*4*8*15*16*23~ProductID*a*b*c*d*e~AddressID*42*108*3*14~");
    });

    it("should handle segments with empty elements", () => {
      const parsedDocument: ParsedDocument = {
        segments: [{ name: "ProductID", elements: ["4", "", "8", "15", "16", "23"] }],
      };

      const result = converter.convertToString(parsedDocument, "~", "*");
      expect(result).toBe("ProductID*4**8*15*16*23~");
    });

    it("should throw error for empty segments", () => {
      const parsedDocument: ParsedDocument = { segments: [] };
      expect(() => converter.convertToString(parsedDocument, "~", "*")).toThrow(
        "No segments to convert",
      );
    });

    it("should handle different separator characters", () => {
      const parsedDocument: ParsedDocument = {
        segments: [{ name: "ProductID", elements: ["4", "8", "15", "16", "23"] }],
      };

      const result = converter.convertToString(parsedDocument, "#", "|");
      expect(result).toBe("ProductID|4|8|15|16|23#");
    });
  });

  describe("convertToJson", () => {
    it("should convert parsed document to JSON format", () => {
      const parsedDocument: ParsedDocument = {
        segments: [
          { name: "ProductID", elements: ["4", "8", "15", "16", "23"] },
          { name: "ProductID", elements: ["a", "b", "c", "d", "e"] },
          { name: "AddressID", elements: ["42", "108", "3", "14"] },
        ],
      };

      const result = converter.convertToJson(parsedDocument);

      expect(result).toEqual({
        ProductID: [
          {
            ProductID1: "4",
            ProductID2: "8",
            ProductID3: "15",
            ProductID4: "16",
            ProductID5: "23",
          },
          { ProductID1: "a", ProductID2: "b", ProductID3: "c", ProductID4: "d", ProductID5: "e" },
        ],
        AddressID: [{ AddressID1: "42", AddressID2: "108", AddressID3: "3", AddressID4: "14" }],
      });
    });

    it("should handle segments with empty elements", () => {
      const parsedDocument: ParsedDocument = {
        segments: [{ name: "ProductID", elements: ["4", "", "8", "15", "16", "23"] }],
      };

      const result = converter.convertToJson(parsedDocument);

      expect(result).toEqual({
        ProductID: [
          {
            ProductID1: "4",
            ProductID2: "",
            ProductID3: "8",
            ProductID4: "15",
            ProductID5: "16",
            ProductID6: "23",
          },
        ],
      });
    });

    it("should throw error for empty segments", () => {
      const parsedDocument: ParsedDocument = { segments: [] };
      expect(() => converter.convertToJson(parsedDocument)).toThrow("No segments to convert");
    });
  });

  describe("convertToXml", () => {
    it("should convert parsed document to XML format", () => {
      const parsedDocument: ParsedDocument = {
        segments: [
          { name: "ProductID", elements: ["4", "8", "15", "16", "23"] },
          { name: "ProductID", elements: ["a", "b", "c", "d", "e"] },
          { name: "AddressID", elements: ["42", "108", "3", "14"] },
        ],
      };

      const result = converter.convertToXml(parsedDocument);

      const expectedXml = `<?xml version="1.0" encoding="UTF-8" ?>
<root>
  <ProductID>
    <ProductID1>4</ProductID1>
    <ProductID2>8</ProductID2>
    <ProductID3>15</ProductID3>
    <ProductID4>16</ProductID4>
    <ProductID5>23</ProductID5>
  </ProductID>
  <ProductID>
    <ProductID1>a</ProductID1>
    <ProductID2>b</ProductID2>
    <ProductID3>c</ProductID3>
    <ProductID4>d</ProductID4>
    <ProductID5>e</ProductID5>
  </ProductID>
  <AddressID>
    <AddressID1>42</AddressID1>
    <AddressID2>108</AddressID2>
    <AddressID3>3</AddressID3>
    <AddressID4>14</AddressID4>
  </AddressID>
</root>`;

      expect(result).toBe(expectedXml);
    });

    it("should handle segments with empty elements", () => {
      const parsedDocument: ParsedDocument = {
        segments: [{ name: "ProductID", elements: ["4", "", "8", "15", "16", "23"] }],
      };

      const result = converter.convertToXml(parsedDocument);

      expect(result).toContain("<ProductID1>4</ProductID1>");
      expect(result).toContain("<ProductID2></ProductID2>");
      expect(result).toContain("<ProductID3>8</ProductID3>");
    });

    it("should escape XML special characters", () => {
      const parsedDocument: ParsedDocument = {
        segments: [
          { name: "Test", elements: ['<script>alert("xss")</script>', "&amp;", ">", '"', "'"] },
        ],
      };

      const result = converter.convertToXml(parsedDocument);

      expect(result).toContain("&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;");
      expect(result).toContain("&amp;amp;");
      expect(result).toContain("&gt;");
      expect(result).toContain("&quot;");
      expect(result).toContain("&apos;");
    });

    it("should throw error for empty segments", () => {
      const parsedDocument: ParsedDocument = { segments: [] };
      expect(() => converter.convertToXml(parsedDocument)).toThrow("No segments to convert");
    });
  });

  describe("round-trip conversion", () => {
    it("should maintain data integrity through format conversions", () => {
      const originalDocument: ParsedDocument = {
        segments: [
          { name: "ProductID", elements: ["4", "8", "15", "16", "23"] },
          { name: "ProductID", elements: ["a", "b", "c", "d", "e"] },
          { name: "AddressID", elements: ["42", "108", "3", "14"] },
        ],
      };

      // Convert to JSON and back
      const jsonResult = converter.convertToJson(originalDocument);
      expect(jsonResult.ProductID).toHaveLength(2);
      expect(jsonResult.AddressID).toHaveLength(1);

      // Convert to XML and verify structure
      const xmlResult = converter.convertToXml(originalDocument);
      expect(xmlResult).toContain("<ProductID>");
      expect(xmlResult).toContain("<AddressID>");
      expect(xmlResult).toContain("</root>");
    });
  });
});
