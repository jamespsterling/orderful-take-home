import { Router } from "express";
import { ConversionController } from "../controllers/conversion-controller";

const router = Router();
const conversionController = new ConversionController();

// Health check endpoint
router.get("/health", (req, res) => conversionController.healthCheck(req, res));

// Main conversion endpoint
router.post("/convert", (req, res) => conversionController.convertDocument(req, res));

// Specific format conversion endpoints
router.post("/convert/string", (req, res) => conversionController.convertToString(req, res));
router.post("/convert/json", (req, res) => conversionController.convertToJson(req, res));
router.post("/convert/xml", (req, res) => conversionController.convertToXml(req, res));

export default router;
