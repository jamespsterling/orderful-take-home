import type { Request, Response } from "express";
import { ConversionService } from "../services/conversion-service";
import { ZodValidator } from "../validation/zod-validator";

export class ConversionController {
  private conversionService: ConversionService;
  private validator: ZodValidator;

  constructor() {
    this.conversionService = new ConversionService();
    this.validator = new ZodValidator();
  }

  async convertDocument(req: Request, res: Response): Promise<void> {
    try {
      const validationResult = this.validator.validateConversionRequest(req.body);

      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          // biome-ignore lint/style/noNonNullAssertion: errors is guaranteed to exist when success is false
          error: `Validation failed: ${this.validator.formatErrors(validationResult.errors!)}`,
        });
        return;
      }

      // biome-ignore lint/style/noNonNullAssertion: data is guaranteed to exist when success is true
      const result = await this.conversionService.convertDocument(validationResult.data!);

      if (result.success && result.data) {
        res.status(200).json({
          success: true,
          data: result.data,
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error || "Conversion failed",
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  }

  async convertToString(req: Request, res: Response): Promise<void> {
    try {
      const validationResult = this.validator.validateStringConversionRequest(req.body);

      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          // biome-ignore lint/style/noNonNullAssertion: errors is guaranteed to exist when success is false
          error: `Validation failed: ${this.validator.formatErrors(validationResult.errors!)}`,
        });
        return;
      }

      // biome-ignore lint/style/noNonNullAssertion: data is guaranteed to exist when success is true
      const { document, segmentSeparator, elementSeparator } = validationResult.data!;
      const result = await this.conversionService.convertToString(
        document,
        segmentSeparator,
        elementSeparator,
      );

      if (result.success && result.data) {
        res.status(200).json({
          success: true,
          data: result.data,
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error || "Conversion failed",
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  }

  async convertToJson(req: Request, res: Response): Promise<void> {
    try {
      const documentValidation = this.validator.validateDocument(req.body.document);

      if (!documentValidation.success) {
        res.status(400).json({
          success: false,
          // biome-ignore lint/style/noNonNullAssertion: errors is guaranteed to exist when success is false
          error: `Document validation failed: ${this.validator.formatErrors(documentValidation.errors!)}`,
        });
        return;
      }

      // biome-ignore lint/style/noNonNullAssertion: data is guaranteed to exist when success is true
      const result = await this.conversionService.convertToJson(documentValidation.data!);

      if (result.success && result.data) {
        res.status(200).json({
          success: true,
          data: result.data,
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error || "Conversion failed",
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  }

  async convertToXml(req: Request, res: Response): Promise<void> {
    try {
      const documentValidation = this.validator.validateDocument(req.body.document);

      if (!documentValidation.success) {
        res.status(400).json({
          success: false,
          // biome-ignore lint/style/noNonNullAssertion: errors is guaranteed to exist when success is false
          error: `Document validation failed: ${this.validator.formatErrors(documentValidation.errors!)}`,
        });
        return;
      }

      // biome-ignore lint/style/noNonNullAssertion: data is guaranteed to exist when success is true
      const result = await this.conversionService.convertToXml(documentValidation.data!);

      if (result.success && result.data) {
        res.status(200).json({
          success: true,
          data: result.data,
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error || "Conversion failed",
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  }

  async healthCheck(_req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      message: "Document Converter API is running",
      timestamp: new Date().toISOString(),
    });
  }
}
