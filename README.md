# Notification Microservice

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?style=flat&logo=rabbitmq&logoColor=white)
![Nodemailer](https://img.shields.io/badge/Nodemailer-0F9DCE?style=flat&logo=minutemailer&logoColor=white)
![Handlebars](https://img.shields.io/badge/Handlebars-000000?style=flat&logo=handlebarsdotjs&logoColor=white)
![Prometheus](https://img.shields.io/badge/Prometheus-E6522C?style=flat&logo=prometheus&logoColor=white)
![OpenTelemetry](https://img.shields.io/badge/OpenTelemetry-7B61FF?style=flat&logo=opentelemetry&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-C21325?style=flat&logo=jest&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=flat&logo=eslint&logoColor=white)
![Prettier](https://img.shields.io/badge/Prettier-F7B93E?style=flat&logo=prettier&logoColor=black)

A NestJS-based microservice responsible for handling email notifications via RabbitMQ message queue. Part of the CoffeeDoor microservices architecture.

## Features

- **Email Notifications**: Send transactional emails with support for HTML content and Handlebars templates
- **RabbitMQ Integration**: Event-driven architecture using RabbitMQ for message consumption
- **Template Engine**: Handlebars-based email templating with caching for performance
- **Observability**:
  - OpenTelemetry tracing with Jaeger integration
  - Prometheus metrics for monitoring
- **Health Checks**: RabbitMQ-based health check endpoint

## Architecture

```
┌─────────────────┐     RabbitMQ      ┌──────────────────────────┐
│  Other Services │ ───────────────── │ Notification Microservice│
└─────────────────┘   Event Pattern   └──────────────────────────┘
                                               │
                                               ▼
                                      ┌─────────────────┐
                                      │   SMTP Server   │
                                      └─────────────────┘
```

## Tech Stack

- **Framework**: NestJS 11
- **Message Queue**: RabbitMQ (AMQP)
- **Email**: Nodemailer with @nestjs-modules/mailer
- **Templates**: Handlebars
- **Tracing**: OpenTelemetry + Jaeger
- **Metrics**: Prometheus (prom-client)
- **Runtime**: Node.js 24

## Project Structure

```
src/
├── main.ts                     # Application entry point
├── app.module.ts               # Root module
├── health-check/               # Health check endpoint
├── mail/
│   ├── mail.module.ts          # Mail module configuration
│   ├── mail.service.ts         # Email sending logic
│   ├── template.service.ts     # Handlebars template rendering
│   ├── email.request.interface.ts
│   └── templates/              # Email templates (.hbs files)
│       ├── verify-email.hbs
│       └── reset-password.hbs
├── notifications/
│   ├── notifications.module.ts
│   ├── notifications.controller.ts  # RabbitMQ event handlers
│   └── notifications.service.ts
├── rmq/
│   ├── rmq.module.ts
│   └── rmq.service.ts          # RabbitMQ ack/nack handling
├── supervision/
│   ├── metrics/                # Prometheus metrics
│   └── tracing/                # OpenTelemetry configuration
└── utils/
    ├── env.dto.ts              # Environment validation
    ├── errors/                 # Error handling utilities
    └── validators/             # Environment validators
```

## Event Patterns

| Pattern | Description |
|---------|-------------|
| `notification.email.send` | Send an email notification |
| `health.check` | Health check request |

## Email Request Interface

```typescript
interface EmailRequest {
  to: string;           // Recipient email address
  subject: string;      // Email subject
  html?: string;        // Raw HTML content
  template?: string;    // Template name (without .hbs extension)
  context?: Record<string, any>;  // Template variables
}
```

## Available Templates

- **verify-email**: Email verification template
  - Context: `{ name: string, verificationLink: string }`
- **reset-password**: Password reset template
  - Context: `{ name: string, resetLink: string }`

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development`, `production` |
| `HTTP_PORT` | HTTP server port | `3000` |
| `RABBITMQ_URL` | RabbitMQ connection URL | `amqp://user:pass@localhost:5672` |
| `RABBITMQ_QUEUE` | Queue name to consume | `notification_queue` |
| `MAIL_HOST` | SMTP server host | `smtp.gmail.com` |
| `MAIL_PORT` | SMTP server port | `587` |
| `MAIL_USERNAME` | SMTP username | `user@example.com` |
| `MAIL_PASSWORD` | SMTP password | `password` |
| `MAIL_FROM` | Default sender email | `noreply@example.com` |
| `MAIL_FROM_NAME` | Default sender name | `CoffeeDoor` |
| `MAIL_SECURE` | Use TLS | `true`, `false` |

## Installation

```bash
npm install
```

## Running the Service

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod

# Debug mode
npm run start:debug
```

## Docker

```bash
# Build the image
docker build -t notification-microservice .

# Run the container
docker run -p 3000:3000 --env-file .env.local notification-microservice
```

## Testing

```bash
# Unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:cov

# E2E tests
npm run test:e2e
```

## Observability

### Metrics

Prometheus metrics are exposed at `/metrics` endpoint. Available metrics include:
- `rmq_events_success_total` - Counter for successfully processed RabbitMQ events
- `rmq_events_failed_total` - Counter for failed RabbitMQ events
- Default Node.js metrics (memory, CPU, event loop, etc.)

### Tracing

OpenTelemetry traces are exported to Jaeger via gRPC on `http://jaeger:4317`. Instrumentation includes:
- HTTP requests
- NestJS core operations
- gRPC calls

## Linting & Formatting

```bash
# Lint and fix
npm run lint

# Format code
npm run format
```

## License

UNLICENSED - Private
