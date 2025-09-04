import app from "./app";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Document Converter API server is running on port ${PORT}`);
  console.log(`📖 API Documentation available at http://localhost:${PORT}/api-docs`);
  console.log(`🏥 Health check available at http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  process.exit(0);
});
