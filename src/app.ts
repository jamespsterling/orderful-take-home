import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";

import { openApiSpec } from "./openapi";
import conversionRoutes from "./routes/conversion-routes";

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:3000"],
    credentials: true,
  }),
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api/", limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logging middleware
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API routes
app.use("/api", conversionRoutes);

// Swagger documentation
app.use("/api-docs", swaggerUi.serve);
app.get(
  "/api-docs",
  swaggerUi.setup(openApiSpec, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Document Converter API Documentation",
  }),
);

// OpenAPI spec endpoint
app.get("/openapi.json", (_req, res) => {
  res.json(openApiSpec);
});

// Root endpoint
app.get("/", (_req, res) => {
  res.json({
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
  });
});

// 404 handler
app.use("*", (_req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
  });
});

// Global error handler
app.use(
  (error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error("Unhandled error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  },
);

export default app;
