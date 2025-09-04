import { MatchersV3 } from "@pact-foundation/pact";
import { describe, expect, it } from "vitest";
import type { ConversionRequest } from "../../../types";
import { DocumentConverterClient } from "../document-converter-client";
import { provider } from "../pact-config";

const { like, eachLike } = MatchersV3;

describe("Document Converter API Consumer Tests", () => {
  describe("Health Check", () => {
    it("should return health status", () => {
      return provider
        .given("API is running")
        .uponReceiving("a health check request")
        .withRequest({
          method: "GET",
          path: "/api/health",
        })
        .willRespondWith({
          status: 200,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
          body: {
            success: true,
            message: like("Document Converter API is running"),
            timestamp: like("2025-09-03T21:59:14.672Z"),
          },
        })
        .executeTest(async (mockServer) => {
          const testClient = new DocumentConverterClient(`http://localhost:${mockServer.port}`);
          const result = await testClient.getHealth();

          expect(result.success).toBe(true);
          expect(result.message).toContain("Document Converter API");
          expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
        });
    });
  });

  describe("API Information", () => {
    it("should return API information", () => {
      return provider
        .given("API is running")
        .uponReceiving("a request for API information")
        .withRequest({
          method: "GET",
          path: "/",
        })
        .willRespondWith({
          status: 200,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
          body: {
            message: like("Document Converter API"),
            version: like("1.0.0"),
            description: like("API to convert documents between String, JSON, and XML formats"),
            documentation: {
              swagger: like("GET /api-docs"),
              openapi: like("GET /openapi.json"),
            },
            endpoints: like({
              health: "GET /api/health",
              convert: "POST /api/convert",
            }),
          },
        })
        .executeTest(async (mockServer) => {
          const testClient = new DocumentConverterClient(`http://localhost:${mockServer.port}`);
          const result = await testClient.getApiInfo();

          expect(result.message).toBe("Document Converter API");
          expect(result.version).toBe("1.0.0");
          expect(result.description).toContain("convert documents");
          expect(result.documentation.swagger).toBe("GET /api-docs");
          expect(result.documentation.openapi).toBe("GET /openapi.json");
        });
    });
  });

  describe("Document Conversion", () => {
    it("should convert string document to JSON", () => {
      const conversionRequest: ConversionRequest = {
        document: {
          format: "string",
          content: "ProductID*4*8*15*16*23~ProductID*a*b*c*d*e~AddressID*42*108*3*14~",
          segmentSeparator: "~",
          elementSeparator: "*",
        },
        targetFormat: "json",
      };

      return provider
        .given("API can convert documents")
        .uponReceiving("a request to convert string to JSON")
        .withRequest({
          method: "POST",
          path: "/api/convert",
          headers: {
            "Content-Type": "application/json",
          },
          body: conversionRequest,
        })
        .willRespondWith({
          status: 200,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
          body: {
            success: true,
            data: {
              format: "json",
              content: like({
                ProductID: eachLike({
                  ProductID1: like("4"),
                  ProductID2: like("8"),
                  ProductID3: like("15"),
                  ProductID4: like("16"),
                  ProductID5: like("23"),
                }),
                AddressID: eachLike({
                  AddressID1: like("42"),
                  AddressID2: like("108"),
                  AddressID3: like("3"),
                  AddressID4: like("14"),
                }),
              }),
            },
          },
        })
        .executeTest(async (mockServer) => {
          const testClient = new DocumentConverterClient(`http://localhost:${mockServer.port}`);
          const result = await testClient.convertDocument(conversionRequest);

          expect(result.success).toBe(true);
          expect(result.data?.format).toBe("json");
          expect(result.data?.content).toHaveProperty("ProductID");
          expect(result.data?.content).toHaveProperty("AddressID");
        });
    });

    it("should convert JSON document to XML", () => {
      const conversionRequest: ConversionRequest = {
        document: {
          format: "json",
          content: {
            ProductID: [
              {
                ProductID1: "4",
                ProductID2: "8",
                ProductID3: "15",
                ProductID4: "16",
                ProductID5: "23",
              },
            ],
          },
        },
        targetFormat: "xml",
      };

      return provider
        .given("API can convert documents")
        .uponReceiving("a request to convert JSON to XML")
        .withRequest({
          method: "POST",
          path: "/api/convert",
          headers: {
            "Content-Type": "application/json",
          },
          body: conversionRequest,
        })
        .willRespondWith({
          status: 200,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
          body: {
            success: true,
            data: {
              format: "xml",
              content: like(
                '<?xml version="1.0" encoding="UTF-8" ?><root><ProductID><ProductID1>4</ProductID1></ProductID></root>',
              ),
            },
          },
        })
        .executeTest(async (mockServer) => {
          const testClient = new DocumentConverterClient(`http://localhost:${mockServer.port}`);
          const result = await testClient.convertDocument(conversionRequest);

          expect(result.success).toBe(true);
          expect(result.data?.format).toBe("xml");
          expect(result.data?.content).toContain("<?xml");
          expect(result.data?.content).toContain("<ProductID>");
        });
    });

    it("should handle validation errors", () => {
      const invalidRequest: ConversionRequest = {
        document: {
          format: "string",
          content: "ProductID*4*8*15*16*23~",
          segmentSeparator: "~",
          elementSeparator: "*",
        },
        targetFormat: "string", // Same format should cause validation error
      };

      return provider
        .given("API validates requests")
        .uponReceiving("a request with validation error")
        .withRequest({
          method: "POST",
          path: "/api/convert",
          headers: {
            "Content-Type": "application/json",
          },
          body: invalidRequest,
        })
        .willRespondWith({
          status: 400,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
          body: {
            success: false,
            error: like("Target format cannot be the same as source format"),
          },
        })
        .executeTest(async (mockServer) => {
          const testClient = new DocumentConverterClient(`http://localhost:${mockServer.port}`);

          try {
            await testClient.convertDocument(invalidRequest);
            expect.fail("Expected an error to be thrown");
          } catch (error) {
            expect(error).toBeInstanceOf(Error);
            if (error instanceof Error) {
              expect(error.message).toContain("400");
            }
          }
        });
    });
  });
});
