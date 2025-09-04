# Contract Testing with Pact

This project includes comprehensive contract testing using [Pact](https://docs.pact.io/5-minute-getting-started-guide) to ensure API compatibility between consumers and providers.

## Overview

Contract testing verifies that the API contract (the interface between services) is maintained. This ensures that:
- Consumers can rely on the API behaving as expected
- Providers don't break existing integrations when making changes
- API changes are communicated clearly through contract evolution

## Test Structure

### Consumer Tests (`src/__tests__/contract/consumer/`)
- **Purpose**: Define the expected API contract from the consumer's perspective
- **What they test**: Request/response format, status codes, headers, and data structure
- **Generated artifacts**: Pact files that describe the contract

### Provider Tests (`src/__tests__/contract/provider/`)
- **Purpose**: Verify that the actual API implementation matches the consumer expectations
- **What they test**: Real API responses against the contract defined by consumers
- **Validation**: Ensures the API meets all consumer expectations

## Running Contract Tests

```bash
# Run consumer tests (generates pact files)
npm run test:consumer

# Run provider verification tests
npm run test:provider

# Run all tests including contract tests
npm run test
```

## Contract Coverage

The current contract tests cover:

### Health Check Endpoint
- **GET /api/health**
- Validates response format and status code
- Ensures proper JSON structure with success, message, and timestamp

### API Information Endpoint
- **GET /**
- Validates API metadata response
- Ensures documentation links are present

### Document Conversion Endpoint
- **POST /api/convert**
- String to JSON conversion
- JSON to XML conversion
- Validation error handling (400 status codes)

## Pact Files

Contract definitions are stored in the `pacts/` directory:
- `DocumentConverterClient-DocumentConverterAPI.json` - The contract between our client and API

## Publishing Contracts

To share contracts with other teams or CI/CD pipelines:

```bash
# Publish to Pact Broker (requires broker URL and token)
npm run pact:publish
```

Set environment variables:
- `PACT_BROKER_URL` - URL of your Pact Broker
- `PACT_BROKER_TOKEN` - Authentication token
- `GIT_COMMIT` - Git commit hash for versioning
- `GIT_BRANCH` - Git branch name for tagging

## Benefits

1. **Early Detection**: Catch breaking changes before they reach production
2. **Documentation**: Pact files serve as living documentation of API contracts
3. **Confidence**: Deploy with confidence knowing integrations won't break
4. **Communication**: Clear contract definitions improve team communication
5. **Evolution**: Safe API evolution with backward compatibility checks

## Integration with CI/CD

Contract tests should be run in your CI/CD pipeline:

1. **Consumer tests** run when client code changes
2. **Provider tests** run when API code changes
3. **Contract publishing** happens on successful builds
4. **Verification** ensures compatibility before deployment

## Best Practices

- Keep consumer tests focused on the contract, not business logic
- Use meaningful provider states for complex scenarios
- Version your contracts appropriately
- Monitor contract evolution over time
- Include error scenarios in your contracts

## Resources

- [Pact Documentation](https://docs.pact.io/)
- [5-Minute Getting Started Guide](https://docs.pact.io/5-minute-getting-started-guide)
- [Pact Broker](https://docs.pact.io/pact_broker/)
- [Contract Testing Best Practices](https://docs.pact.io/best_practices/)
