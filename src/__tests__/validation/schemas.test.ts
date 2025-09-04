import { describe, expect, it } from "vitest";
import {
  ConversionRequestSchema,
  DocumentSchema,
  StringConversionRequestSchema,
} from "../../validation/schemas";

describe("DocumentSchema", () => {
  describe("String Document", () => {
    it("should validate a valid string document", () => {
      const document = {
        format: "string",
        content: "ISA*00*          *00*          *12*5032337522",
        segmentSeparator: "~",
        elementSeparator: "*",
      };

      const result = DocumentSchema.safeParse(document);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(document);
      }
    });

    it("should reject string document without content", () => {
      const document = {
        format: "string",
        content: "",
        segmentSeparator: "~",
        elementSeparator: "*",
      };

      const result = DocumentSchema.safeParse(document);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Content cannot be empty");
      }
    });

    it("should reject string document without segment separator", () => {
      const document = {
        format: "string",
        content: "ISA*00*          *00*          *12*5032337522",
        elementSeparator: "*",
      };

      const result = DocumentSchema.safeParse(document);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("expected string, received undefined");
      }
    });

    it("should reject string document without element separator", () => {
      const document = {
        format: "string",
        content: "ISA*00*          *00*          *12*5032337522",
        segmentSeparator: "~",
      };

      const result = DocumentSchema.safeParse(document);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("expected string, received undefined");
      }
    });
  });

  describe("JSON Document", () => {
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

      const result = DocumentSchema.safeParse(document);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(document);
      }
    });

    it("should validate JSON document with empty content", () => {
      const document = {
        format: "json",
        content: {},
      };

      const result = DocumentSchema.safeParse(document);
      expect(result.success).toBe(true);
    });

    it("should validate JSON document with complex nested structure", () => {
      const document = {
        format: "json",
        content: {
          ISA: [{ ISA1: "00", ISA2: "          " }],
          GS: [{ GS1: "PO", GS2: "SENDER", GS3: "RECEIVER" }],
          ST: [{ ST1: "850", ST2: "000000579" }],
        },
      };

      const result = DocumentSchema.safeParse(document);
      expect(result.success).toBe(true);
    });
  });

  describe("XML Document", () => {
    it("should validate a valid XML document", () => {
      const document = {
        format: "xml",
        content: '<?xml version="1.0" encoding="UTF-8" ?><root><ISA><ISA1>00</ISA1></ISA></root>',
      };

      const result = DocumentSchema.safeParse(document);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(document);
      }
    });

    it("should reject XML document with empty content", () => {
      const document = {
        format: "xml",
        content: "",
      };

      const result = DocumentSchema.safeParse(document);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("XML content cannot be empty");
      }
    });

    it("should validate XML document with complex content", () => {
      const document = {
        format: "xml",
        content: `<?xml version="1.0" encoding="UTF-8" ?>
<root>
  <ISA>
    <ISA1>00</ISA1>
    <ISA2>          </ISA2>
    <ISA3>00</ISA3>
    <ISA4>          </ISA4>
    <ISA5>12</ISA5>
    <ISA6>5032337522     </ISA6>
  </ISA>
  <GS>
    <GS1>PO</GS1>
    <GS2>SENDER</GS2>
    <GS3>RECEIVER</GS3>
  </GS>
</root>`,
      };

      const result = DocumentSchema.safeParse(document);
      expect(result.success).toBe(true);
    });
  });

  describe("Invalid Format", () => {
    it("should reject document with invalid format", () => {
      const document = {
        format: "invalid",
        content: "some content",
      };

      const result = DocumentSchema.safeParse(document);
      expect(result.success).toBe(false);
    });

    it("should reject document without format", () => {
      const document = {
        content: "some content",
      };

      const result = DocumentSchema.safeParse(document);
      expect(result.success).toBe(false);
    });
  });
});

describe("ConversionRequestSchema", () => {
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

    const result = ConversionRequestSchema.safeParse(request);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(request);
    }
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

    const result = ConversionRequestSchema.safeParse(request);
    expect(result.success).toBe(true);
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

    const result = ConversionRequestSchema.safeParse(request);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Target format cannot be the same as source format",
      );
    }
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

    const result = ConversionRequestSchema.safeParse(request);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Segment and element separators are required when converting to string format",
      );
    }
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

    const result = ConversionRequestSchema.safeParse(request);
    expect(result.success).toBe(false);
  });
});

describe("StringConversionRequestSchema", () => {
  it("should validate a valid string conversion request", () => {
    const request = {
      document: {
        format: "json",
        content: { ISA: [{ ISA1: "00" }] },
      },
      segmentSeparator: "~",
      elementSeparator: "*",
    };

    const result = StringConversionRequestSchema.safeParse(request);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(request);
    }
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

    const result = StringConversionRequestSchema.safeParse(request);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Segment and element separators must be different",
      );
    }
  });

  it("should reject request with empty segment separator", () => {
    const request = {
      document: {
        format: "json",
        content: { ISA: [{ ISA1: "00" }] },
      },
      segmentSeparator: "",
      elementSeparator: "*",
    };

    const result = StringConversionRequestSchema.safeParse(request);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Segment separator is required");
    }
  });

  it("should reject request with empty element separator", () => {
    const request = {
      document: {
        format: "json",
        content: { ISA: [{ ISA1: "00" }] },
      },
      segmentSeparator: "~",
      elementSeparator: "",
    };

    const result = StringConversionRequestSchema.safeParse(request);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Element separator is required");
    }
  });
});

describe("Schema Type Inference", () => {
  it("should correctly infer Document type", () => {
    // This test ensures TypeScript compilation works correctly
    const validStringDocument = {
      format: "string" as const,
      content: "ISA*00*          *00*          *12*5032337522",
      segmentSeparator: "~",
      elementSeparator: "*",
    };

    const result = DocumentSchema.safeParse(validStringDocument);
    expect(result.success).toBe(true);

    if (result.success) {
      // TypeScript should know this is a string document
      expect(result.data.format).toBe("string");
      if (result.data.format === "string") {
        expect(result.data.segmentSeparator).toBeDefined();
        expect(result.data.elementSeparator).toBeDefined();
      }
    }
  });

  it("should correctly infer ConversionRequest type", () => {
    const validRequest = {
      document: {
        format: "string" as const,
        content: "ISA*00*          *00*          *12*5032337522",
        segmentSeparator: "~",
        elementSeparator: "*",
      },
      targetFormat: "json" as const,
    };

    const result = ConversionRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);

    if (result.success) {
      // TypeScript should know the target format
      expect(result.data.targetFormat).toBe("json");
      expect(result.data.document.format).toBe("string");
    }
  });
});
