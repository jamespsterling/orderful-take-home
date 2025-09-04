import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";

// Get the directory path for CommonJS
const __dirname = dirname(__filename);

// Read the example data
const exampleData = readFileSync(join(__dirname, "example.txt"), "utf-8").trim();

console.log("🚀 Document Converter API Demo");
console.log("================================");
console.log();

// Test data for conversion
const testData = {
  string: {
    format: "string" as const,
    content: "ProductID*4*8*15*16*23~ProductID*a*b*c*d*e~AddressID*42*108*3*14~",
    segmentSeparator: "~",
    elementSeparator: "*",
  },
  json: {
    format: "json" as const,
    content: {
      ProductID: [
        { ProductID1: "4", ProductID2: "8", ProductID3: "15", ProductID4: "16", ProductID5: "23" },
        { ProductID1: "a", ProductID2: "b", ProductID3: "c", ProductID4: "d", ProductID5: "e" },
      ],
      AddressID: [{ AddressID1: "42", AddressID2: "108", AddressID3: "3", AddressID4: "14" }],
    },
  },
  xml: {
    format: "xml" as const,
    content:
      '<?xml version="1.0" encoding="UTF-8" ?><root><ProductID><ProductID1>4</ProductID1><ProductID2>8</ProductID2><ProductID3>15</ProductID3><ProductID4>16</ProductID4><ProductID5>23</ProductID5></ProductID></root>',
  },
};

// Example API calls
console.log("📋 Example API Calls:");
console.log();

// Convert string to JSON
console.log("1. Convert String to JSON:");
console.log("POST /api/convert");
console.log(
  JSON.stringify(
    {
      document: testData.string,
      targetFormat: "json",
    },
    null,
    2,
  ),
);
console.log();

// Convert string to XML
console.log("2. Convert String to XML:");
console.log("POST /api/convert");
console.log(
  JSON.stringify(
    {
      document: testData.string,
      targetFormat: "xml",
    },
    null,
    2,
  ),
);
console.log();

// Convert JSON to String
console.log("3. Convert JSON to String:");
console.log("POST /api/convert");
console.log(
  JSON.stringify(
    {
      document: testData.json,
      targetFormat: "string",
      segmentSeparator: "~",
      elementSeparator: "*",
    },
    null,
    2,
  ),
);
console.log();

// Convert JSON to XML
console.log("4. Convert JSON to XML:");
console.log("POST /api/convert");
console.log(
  JSON.stringify(
    {
      document: testData.json,
      targetFormat: "xml",
    },
    null,
    2,
  ),
);
console.log();

// Convert XML to JSON
console.log("5. Convert XML to JSON:");
console.log("POST /api/convert");
console.log(
  JSON.stringify(
    {
      document: testData.xml,
      targetFormat: "json",
    },
    null,
    2,
  ),
);
console.log();

// Convert XML to String
console.log("6. Convert XML to String:");
console.log("POST /api/convert");
console.log(
  JSON.stringify(
    {
      document: testData.xml,
      targetFormat: "string",
      segmentSeparator: "~",
      elementSeparator: "*",
    },
    null,
    2,
  ),
);
console.log();

console.log("📊 EDI X12 Example Data:");
console.log("The API can handle complex EDI data like:");
console.log(`${exampleData.substring(0, 200)}...`);
console.log();

console.log("🔧 To test the API:");
console.log("1. Start the server: npm run dev");
console.log("2. Use the examples above with curl or Postman");
console.log("3. Run tests: npm test");
console.log();

console.log("📖 Full API documentation available at: http://localhost:3000/api-docs");
console.log("🏥 Health check: http://localhost:3000/api/health");
