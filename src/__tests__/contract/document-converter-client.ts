import type { ConversionRequest, ConversionResponse } from "../../types";

// Response types for better type safety
interface HealthResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

interface ApiInfoResponse {
  message: string;
  version: string;
  description: string;
  documentation: {
    swagger: string;
    openapi: string;
  };
  endpoints: Record<string, string>;
}

interface ErrorResponse {
  success: false;
  error: string;
}

export class DocumentConverterClient {
  private baseUrl: string;

  constructor(baseUrl: string = "http://localhost:3000") {
    this.baseUrl = baseUrl;
  }

  private async safeJsonParse<T>(response: Response): Promise<T> {
    const text = await response.text();
    try {
      return JSON.parse(text) as T;
    } catch (error) {
      throw new Error(
        `Failed to parse JSON response: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async convertDocument(request: ConversionRequest): Promise<ConversionResponse> {
    const response = await fetch(`${this.baseUrl}/api/convert`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await this.safeJsonParse<ErrorResponse>(response);
      throw new Error(`API Error: ${response.status} - ${errorData.error || "Unknown error"}`);
    }

    return this.safeJsonParse<ConversionResponse>(response);
  }

  async getHealth(): Promise<HealthResponse> {
    const response = await fetch(`${this.baseUrl}/api/health`);

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }

    return this.safeJsonParse<HealthResponse>(response);
  }

  async getApiInfo(): Promise<ApiInfoResponse> {
    const response = await fetch(`${this.baseUrl}/`);

    if (!response.ok) {
      throw new Error(`API info failed: ${response.status}`);
    }

    return this.safeJsonParse<ApiInfoResponse>(response);
  }
}
