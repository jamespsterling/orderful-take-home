#!/usr/bin/env node

import path from "node:path";
import { Publisher } from "@pact-foundation/pact";

const opts = {
  pactFilesOrDirs: [path.resolve(process.cwd(), "pacts")],
  pactBroker: process.env.PACT_BROKER_URL || "https://test.pactflow.io",
  pactBrokerToken: process.env.PACT_BROKER_TOKEN || "your-token-here",
  consumerVersion: process.env.GIT_COMMIT || "1.0.0",
  tags: [process.env.GIT_BRANCH || "main"],
};

new Publisher(opts)
  .publishPacts()
  .then(() => {
    console.log("Pact contract publishing complete!");
    console.log(`Head over to ${opts.pactBroker} and login with`);
    console.log("to see your published contracts.");
  })
  .catch((e) => {
    console.error("Pact contract publishing failed: ", e);
    process.exit(1);
  });
