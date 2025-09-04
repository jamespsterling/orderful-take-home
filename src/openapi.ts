import { OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import type { OpenAPIV3 } from "openapi-types";
import { z } from "zod";

import { ConversionRequestSchema, DocumentSchema } from "./validation/schemas";

// Create OpenAPI registry
const registry = new OpenAPIRegistry();

// Register our schemas with OpenAPI metadata
registry.register("Document", DocumentSchema);
registry.register("ConversionRequest", ConversionRequestSchema);

// Define additional schemas for responses
const ConversionResponseSchema = z.object({
  success: z.boolean(),
  data: DocumentSchema.optional(),
  error: z.string().optional(),
});

const ErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
});

const ApiInfoSchema = z.object({
  message: z.string(),
  version: z.string(),
  description: z.string(),
  documentation: z.object({
    swagger: z.string(),
    openapi: z.string(),
  }),
  endpoints: z.record(z.string(), z.string()),
});

const HealthResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  timestamp: z.string(),
});

// Register additional schemas
registry.register("ConversionResponse", ConversionResponseSchema);
registry.register("ErrorResponse", ErrorResponseSchema);
registry.register("ApiInfo", ApiInfoSchema);
registry.register("HealthResponse", HealthResponseSchema);

// Generate OpenAPI components
const generator = new OpenApiGeneratorV3(registry.definitions);
const components = generator.generateComponents();

export const openApiSpec: OpenAPIV3.Document = {
  openapi: "3.0.3",
  info: {
    title: "Document Converter API",
    description: "API to convert documents between String, JSON, and XML formats",
    version: "1.0.0",
    contact: {
      name: "API Support",
      email: "support@example.com",
    },
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Development server",
    },
    {
      url: "https://api.example.com",
      description: "Production server",
    },
  ],
  paths: {
    "/": {
      get: {
        summary: "API Information",
        description: "Get basic information about the Document Converter API",
        tags: ["Info"],
        responses: {
          "200": {
            description: "API information",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiInfo" },
                example: {
                  message: "Document Converter API",
                  version: "1.0.0",
                  description: "API to convert documents between String, JSON, and XML formats",
                  documentation: {
                    swagger: "GET /api-docs",
                    openapi: "GET /openapi.json",
                  },
                  endpoints: {
                    health: "GET /api/health",
                    convert: "POST /api/convert",
                    convertToString: "POST /api/convert/string",
                    convertToJson: "POST /api/convert/json",
                    convertToXml: "POST /api/convert/xml",
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/health": {
      get: {
        summary: "Health Check",
        description: "Check if the API is running and healthy",
        tags: ["Health"],
        responses: {
          "200": {
            description: "API is healthy",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/HealthResponse" },
                example: {
                  success: true,
                  message: "Document Converter API is running",
                  timestamp: "2025-09-03T21:59:14.672Z",
                },
              },
            },
          },
        },
      },
    },
    "/api/convert": {
      post: {
        summary: "Convert Document",
        description: "Convert a document from one format to another",
        tags: ["Conversion"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ConversionRequest" },
              examples: {
                "string-to-json": {
                  summary: "Convert String to JSON",
                  value: {
                    document: {
                      format: "string",
                      content: "ProductID*4*8*15*16*23~ProductID*a*b*c*d*e~AddressID*42*108*3*14~",
                      segmentSeparator: "~",
                      elementSeparator: "*",
                    },
                    targetFormat: "json",
                  },
                },
                "json-to-xml": {
                  summary: "Convert JSON to XML",
                  value: {
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
                  },
                },
                "xml-to-string": {
                  summary: "Convert XML to String",
                  value: {
                    document: {
                      format: "xml",
                      content:
                        '<?xml version="1.0" encoding="UTF-8" ?><root><ProductID><ProductID1>4</ProductID1></ProductID></root>',
                    },
                    targetFormat: "string",
                    segmentSeparator: "~",
                    elementSeparator: "*",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Document converted successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ConversionResponse" },
                examples: {
                  "string-to-json-response": {
                    summary: "String to JSON conversion response",
                    value: {
                      success: true,
                      data: {
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
                    },
                  },
                  "json-to-xml-response": {
                    summary: "JSON to XML conversion response",
                    value: {
                      success: true,
                      data: {
                        format: "xml",
                        content:
                          '<?xml version="1.0" encoding="UTF-8" ?><root><ProductID><ProductID1>4</ProductID1><ProductID2>8</ProductID2><ProductID3>15</ProductID3><ProductID4>16</ProductID4><ProductID5>23</ProductID5></ProductID></root>',
                      },
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Bad request - validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                example: {
                  success: false,
                  error:
                    "Validation failed: Segment separator is required when converting to string format",
                },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                example: {
                  success: false,
                  error: "Conversion failed: Unsupported input format",
                },
              },
            },
          },
        },
      },
    },
  },
  // biome-ignore lint/suspicious/noExplicitAny: OpenAPI type compatibility issue between libraries
  components: components.components as any,
  tags: [
    {
      name: "Info",
      description: "General API information endpoints",
    },
    {
      name: "Health",
      description: "Health check and monitoring endpoints",
    },
    {
      name: "Conversion",
      description: "Document format conversion endpoints",
    },
  ],
  externalDocs: {
    description: "Find more info about Document Converter API",
    url: "https://github.com/example/document-converter-api",
  },
};
