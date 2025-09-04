import { Verifier } from "@pact-foundation/pact";
import { afterAll, beforeAll, describe, it } from "vitest";
import app from "../../../app";
import { consumerName, providerName } from "../pact-config";

describe("Document Converter API Provider Verification", () => {
  let server: ReturnType<typeof app.listen>;
  let port: number;

  beforeAll(async () => {
    // Start the server on a random port
    port = Math.floor(Math.random() * 10000) + 3000;
    server = app.listen(port, () => {
      console.log(`Provider service listening on http://localhost:${port}`);
    });
  });

  afterAll(() => {
    if (server) {
      server.close();
    }
  });

  it("should validate the expectations of DocumentConverterClient", () => {
    const opts = {
      provider: providerName,
      providerBaseUrl: `http://localhost:${port}`,
      // For local testing, we'll use the pact file directly
      // In a real scenario, you'd use a Pact Broker
      pactUrls: [`${process.cwd()}/pacts/${consumerName}-${providerName}.json`],
      publishVerificationResult: false,
      providerVersion: "1.0.0",
      providerVersionBranch: "main",
      // Enable detailed logging for debugging
      logLevel: "info" as const,
    };

    return new Verifier(opts)
      .verifyProvider()
      .then((output) => {
        console.log("Pact Verification Complete!");
        console.log(output);
      })
      .catch((e) => {
        console.error("Pact verification failed :(", e);
        throw e;
      });
  });
});
