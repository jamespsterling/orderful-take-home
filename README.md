# Document Converter API

A robust API for converting documents between three different formats: String, JSON, and XML. Built with TypeScript, Node.js, and Express, following production-ready architecture patterns.

## Features

- **Multi-format Support**: Convert between String, JSON, and XML formats
- **Flexible Separators**: Customizable segment and element separators for string format
- **Input Validation**: Comprehensive validation for all input formats
- **Production Ready**: Security middleware, rate limiting, error handling
- **Extensible Architecture**: Easy to add new formats and converters
- **Comprehensive Testing**: Unit tests, integration tests, and example data validation

## Architecture

The solution follows a clean, layered architecture:

```
src/
├── types/           # TypeScript interfaces and types
├── converters/      # Core conversion logic
├── validation/      # Input validation services
├── services/        # Business logic orchestration
├── controllers/     # HTTP request handlers
├── routes/          # Express route definitions
└── app.ts          # Express application setup
```

### Key Components

- **StringConverter**: Handles parsing and serializing string format documents
- **FormatConverter**: Converts parsed documents to different output formats
- **DocumentConverter**: Orchestrates all conversion operations
- **DocumentValidator**: Validates input documents and conversion requests
- **ConversionService**: Main service layer for business logic
- **ConversionController**: HTTP API controller

## Installation

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd document-converter-api
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

4. Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## Usage

### API Endpoints

#### Health Check
```http
GET /api/health
```

#### Convert Document (General)
```http
POST /api/convert
Content-Type: application/json

{
  "document": {
    "format": "string",
    "content": "ProductID*4*8*15*16*23~ProductID*a*b*c*d*e~",
    "segmentSeparator": "~",
    "elementSeparator": "*"
  },
  "targetFormat": "json"
}
```

#### Convert to String
```http
POST /api/convert/string
Content-Type: application/json

{
  "document": {
    "format": "json",
    "content": {
      "ProductID": [
        {
          "ProductID1": "4",
          "ProductID2": "8",
          "ProductID3": "15",
          "ProductID4": "16",
          "ProductID5": "23"
        }
      ]
    }
  },
  "segmentSeparator": "~",
  "elementSeparator": "*"
}
```

#### Convert to JSON
```http
POST /api/convert/json
Content-Type: application/json

{
  "document": {
    "format": "string",
    "content": "ProductID*4*8*15*16*23~ProductID*a*b*c*d*e~",
    "segmentSeparator": "~",
    "elementSeparator": "*"
  }
}
```

#### Convert to XML
```http
POST /api/convert/xml
Content-Type: application/json

{
  "document": {
    "format": "string",
    "content": "ProductID*4*8*15*16*23~ProductID*a*b*c*d*e~",
    "segmentSeparator": "~",
    "elementSeparator": "*"
  }
}
```

### Example Data Conversion

The API includes comprehensive support for the EDI X12 example data provided in the challenge. The example data demonstrates:

- **ISA Segment**: EDI header information
- **GS Segment**: Functional group header
- **ST Segment**: Transaction set header
- **BEG Segment**: Beginning segment for purchase order
- **PO1 Segments**: Purchase order line items
- **PID Segments**: Product identification
- **CTT Segment**: Transaction totals
- **SE/GE/IEA Segments**: Transaction, group, and interchange trailers

### Format Specifications

#### String Format
- Segments separated by a configurable separator character
- Elements within segments separated by a configurable separator character
- Example: `ProductID*4*8*15*16*23~ProductID*a*b*c*d*e~`

#### JSON Format
- Segments as arrays of objects
- Element keys follow the pattern: `{SegmentName}{ElementNumber}`
- Example:
```json
{
  "ProductID": [
    {
      "ProductID1": "4",
      "ProductID2": "8",
      "ProductID3": "15",
      "ProductID4": "16",
      "ProductID5": "23"
    }
  ]
}
```

#### XML Format
- Root element containing all segments
- Each segment as a child element
- Elements as numbered child elements
- Example:
```xml
<?xml version="1.0" encoding="UTF-8" ?>
<root>
  <ProductID>
    <ProductID1>4</ProductID1>
    <ProductID2>8</ProductID2>
    <ProductID3>15</ProductID3>
    <ProductID4>16</ProductID4>
    <ProductID5>23</ProductID5>
  </ProductID>
</root>
```

## Development

### Scripts

- `npm run build` - Build the TypeScript project
- `npm run dev` - Start development server with hot reload
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Run linting checks
- `npm run lint:fix` - Fix linting issues
- `npm run format` - Format code

### Testing

The project includes comprehensive test coverage:

- **Unit Tests**: Individual component testing
- **Integration Tests**: End-to-end conversion testing
- **Example Data Tests**: Validation against the provided EDI data

Run tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm test -- --coverage
```

### Code Quality

The project uses Biome for linting and formatting:

```bash
npm run lint        # Check for issues
npm run lint:fix    # Fix issues automatically
npm run format      # Format code
```

## Extensibility

The architecture is designed to easily accommodate new formats:

1. **Add new format type** in `src/types/index.ts`
2. **Implement converter** in `src/converters/`
3. **Add validation** in `src/validation/`
4. **Update service layer** in `src/services/`
5. **Add API endpoints** in `src/controllers/` and `src/routes/`

### Adding a New Format

Example for adding CSV format:

```typescript
// 1. Add to types
export type DocumentFormat = 'string' | 'json' | 'xml' | 'csv';

export interface CsvDocument {
  format: 'csv';
  content: string;
  delimiter: string;
}

// 2. Implement converter
export class CsvConverter implements IConverter {
  // Implementation
}

// 3. Add to main converter
// 4. Add validation
// 5. Add API endpoints
```

## Security Features

- **Helmet**: Security headers
- **CORS**: Configurable cross-origin requests
- **Rate Limiting**: API rate limiting (100 requests per 15 minutes)
- **Input Validation**: Comprehensive input sanitization
- **Error Handling**: Secure error responses

## Performance Considerations

- **Efficient Parsing**: Optimized string parsing algorithms
- **Memory Management**: Stream-based processing for large documents
- **Caching**: Ready for Redis integration
- **Async Processing**: Non-blocking I/O operations

## Production Deployment

### Environment Variables

- `PORT`: Server port (default: 3000)
- `ALLOWED_ORIGINS`: CORS allowed origins (comma-separated)

### Docker Support

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["npm", "start"]
```

### Health Checks

The API includes health check endpoints for monitoring:

```bash
curl http://localhost:3000/api/health
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For questions or issues, please open an issue in the repository.
