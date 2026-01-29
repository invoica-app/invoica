# Invoicer Backend API

Spring Boot + Kotlin REST API for the Invoicer application.

## Tech Stack

- **Kotlin** 1.9.22
- **Spring Boot** 3.2.2
- **Spring Data JPA**
- **H2 Database** (dev) / PostgreSQL (prod)
- **Gradle** (Kotlin DSL)
- **Bean Validation**

## Features

- ✅ RESTful API for invoice management
- ✅ CRUD operations (Create, Read, Update, Delete)
- ✅ Invoice status tracking (DRAFT, SENT, PAID, CANCELLED)
- ✅ Line items with automatic total calculation
- ✅ Input validation
- ✅ Global exception handling
- ✅ CORS configuration for frontend
- ✅ H2 in-memory database for development

## Project Structure

```
backend/
├── src/main/kotlin/com/invoicer/
│   ├── InvoicerApplication.kt      # Main application
│   ├── config/
│   │   └── WebConfig.kt            # CORS configuration
│   ├── controller/
│   │   └── InvoiceController.kt    # REST endpoints
│   ├── dto/
│   │   └── InvoiceDto.kt           # Request/Response DTOs
│   ├── entity/
│   │   ├── Invoice.kt              # Invoice entity
│   │   └── LineItem.kt             # Line item entity
│   ├── exception/
│   │   ├── Exceptions.kt           # Custom exceptions
│   │   └── GlobalExceptionHandler.kt # Exception handling
│   ├── repository/
│   │   └── InvoiceRepository.kt    # Data access
│   └── service/
│       └── InvoiceService.kt       # Business logic
└── src/main/resources/
    └── application.yml              # Configuration
```

## API Endpoints

### Invoices

```
POST   /api/invoices           # Create invoice
GET    /api/invoices           # Get all invoices
GET    /api/invoices?status=DRAFT  # Filter by status
GET    /api/invoices/{id}      # Get invoice by ID
PUT    /api/invoices/{id}      # Update invoice
DELETE /api/invoices/{id}      # Delete invoice
```

## Data Model

### Invoice
```kotlin
{
  "id": Long,
  "companyName": String,
  "companyLogo": String?,
  "address": String,
  "city": String,
  "zipCode": String,
  "country": String,
  "phone": String,
  "companyEmail": String,
  "invoiceNumber": String,
  "invoiceDate": LocalDate,
  "dueDate": LocalDate,
  "primaryColor": String,
  "fontFamily": String,
  "clientEmail": String,
  "emailSubject": String?,
  "emailMessage": String?,
  "lineItems": [LineItem],
  "totalAmount": BigDecimal,
  "status": "DRAFT|SENT|PAID|CANCELLED",
  "createdAt": LocalDateTime,
  "updatedAt": LocalDateTime
}
```

### Line Item
```kotlin
{
  "id": Long,
  "description": String,
  "quantity": Int,
  "rate": BigDecimal,
  "amount": BigDecimal
}
```

## Getting Started

### Prerequisites

- JDK 17 or higher
- Gradle 8.x (or use included wrapper)

### Run the Application

```bash
# Using Gradle wrapper
./gradlew bootRun

# Or build and run
./gradlew build
java -jar build/libs/invoicer-backend-0.0.1-SNAPSHOT.jar
```

The API will start on `http://localhost:8080`

### H2 Console

Access the H2 database console at: `http://localhost:8080/h2-console`

- JDBC URL: `jdbc:h2:mem:invoicer`
- Username: `sa`
- Password: (empty)

## Example Usage

### Create Invoice

```bash
curl -X POST http://localhost:8080/api/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Acme Corp",
    "address": "123 Business St",
    "city": "Tech City",
    "zipCode": "10001",
    "country": "USA",
    "phone": "+1 (555) 123-4567",
    "companyEmail": "billing@acme.com",
    "invoiceNumber": "INV-001",
    "invoiceDate": "2026-01-29",
    "dueDate": "2026-02-05",
    "primaryColor": "#9747E6",
    "fontFamily": "Inter",
    "clientEmail": "client@example.com",
    "emailSubject": "Invoice INV-001 from Acme Corp",
    "emailMessage": "Hi,\n\nPlease find attached...",
    "lineItems": [
      {
        "description": "Web Design Services",
        "quantity": 10,
        "rate": 150.00
      },
      {
        "description": "Hosting (Annual)",
        "quantity": 1,
        "rate": 200.00
      }
    ]
  }'
```

### Get All Invoices

```bash
curl http://localhost:8080/api/invoices
```

### Get Invoice by ID

```bash
curl http://localhost:8080/api/invoices/1
```

### Update Invoice

```bash
curl -X PUT http://localhost:8080/api/invoices/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "SENT"
  }'
```

### Delete Invoice

```bash
curl -X DELETE http://localhost:8080/api/invoices/1
```

## Configuration

Edit `src/main/resources/application.yml` to configure:

- Database connection
- Server port
- Logging levels
- JPA settings

### Switch to PostgreSQL

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/invoicer
    username: postgres
    password: yourpassword
  jpa:
    hibernate:
      ddl-auto: update
```

## Testing

```bash
./gradlew test
```

## Build for Production

```bash
./gradlew clean build
```

The JAR file will be in `build/libs/`

## Next Steps

- [ ] Add authentication (Spring Security + JWT)
- [ ] Add PDF generation
- [ ] Add email sending
- [ ] Add pagination for list endpoints
- [ ] Add search/filter capabilities
- [ ] Add invoice templates
- [ ] Add file upload for company logo
- [ ] Add audit logging
- [ ] Add integration tests
- [ ] Add API documentation (Swagger/OpenAPI)

## License

MIT
