import path from "node:path";
import { PactV3 } from "@pact-foundation/pact";

// Consumer and Provider names
export const consumerName = "DocumentConverterClient";
export const providerName = "DocumentConverterAPI";

// Pact configuration
export const provider = new PactV3({
  consumer: consumerName,
  provider: providerName,
  port: 0, // Use random available port
  logLevel: "info",
  spec: 3,
});

// Pact file path
export const pactFile = path.resolve(
  process.cwd(),
  "pacts",
  `${consumerName}-${providerName}.json`,
);
