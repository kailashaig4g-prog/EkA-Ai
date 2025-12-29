# Architecture Overview

## System Architecture

EkA-Ai follows a modern, scalable three-tier architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   React UI   │  │   Mobile App │  │  Third-Party │      │
│  │  (Frontend)  │  │   (Future)   │  │  Integrations│      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓ HTTPS/WSS
┌─────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                        │
│  ┌──────────────────────────────────────────────────┐       │
│  │              Express.js API Server                │       │
│  │  ┌─────────┐  ┌─────────┐  ┌──────────────┐     │       │
│  │  │  Auth   │  │  Chat   │  │   Vehicle    │     │       │
│  │  │ Routes  │  │ Routes  │  │   Routes     │     │       │
│  │  └─────────┘  └─────────┘  └──────────────┘     │       │
│  │  ┌─────────────────────────────────────────┐    │       │
│  │  │         Middleware Layer               │    │       │
│  │  │  Auth │ Validation │ Rate Limit │ etc. │    │       │
│  │  └─────────────────────────────────────────┘    │       │
│  │  ┌─────────────────────────────────────────┐    │       │
│  │  │         Business Logic Layer           │    │       │
│  │  │  Controllers │ Services │ Utilities    │    │       │
│  │  └─────────────────────────────────────────┘    │       │
│  └──────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      DATA & SERVICES LAYER                   │
│  ┌─────────┐  ┌─────────┐  ┌──────────┐  ┌──────────┐     │
│  │ MongoDB │  │  Redis  │  │ OpenAI   │  │  AWS S3  │     │
│  │Database │  │  Cache  │  │  GPT-4   │  │  Storage │     │
│  └─────────┘  └─────────┘  └──────────┘  └──────────┘     │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. API Server (Express.js)

**Responsibilities:**
- HTTP request handling
- Request routing
- Response formatting
- Session management
- WebSocket connections

**Key Features:**
- RESTful API design
- JWT-based authentication
- Rate limiting
- Request validation
- Error handling

### 2. Middleware Layer

**Security Middleware:**
- `helmet` - Security headers
- `cors` - Cross-origin resource sharing
- `xss-clean` - XSS attack prevention
- `express-mongo-sanitize` - NoSQL injection prevention
- `hpp` - HTTP parameter pollution prevention

**Operational Middleware:**
- `morgan` - HTTP request logging
- `compression` - Response compression
- `response-time` - Response time tracking
- `requestId` - Request tracking

### 3. Controllers

Handle business logic for specific domains:

- **AuthController** - User registration, login, OAuth
- **ChatController** - AI chat interactions
- **VehicleController** - Vehicle management
- **ServiceHistoryController** - Maintenance records
- **WorkshopController** - Workshop directory
- **NotificationController** - User notifications

### 4. Services

External service integrations:

- **OpenAIService** - GPT-4, Whisper, Vision API
- **CacheService** - Redis caching operations
- **EmailService** - Email notifications
- **StorageService** - File upload/storage
- **QueueService** - Background job processing

### 5. Data Models (Mongoose)

**User Model:**
- Authentication credentials
- Profile information
- API keys
- 2FA settings

**Vehicle Model:**
- Vehicle specifications
- Ownership tracking
- Service schedules

**ServiceHistory Model:**
- Maintenance records
- Cost tracking
- Workshop information

**Workshop Model:**
- Location data
- Services offered
- Ratings and reviews

## Data Flow

### Authentication Flow

```
1. User → POST /auth/register → Controller
2. Controller → Validate input → Middleware
3. Controller → Hash password → bcrypt
4. Controller → Create user → MongoDB
5. Controller → Generate JWT → User
6. Response ← JWT token ← User
```

### Chat Message Flow

```
1. User → POST /chat → Controller (with JWT)
2. Middleware → Verify JWT → Extract user
3. Controller → Get vehicle context → MongoDB
4. Controller → Build prompt → OpenAI Service
5. OpenAI Service → Call GPT-4 → OpenAI API
6. Controller → Cache response → Redis
7. Response ← AI message ← User
```

## Security Architecture

### Authentication & Authorization

```
┌──────────────┐
│   Request    │
└──────┬───────┘
       ↓
┌──────────────┐
│  JWT Verify  │
└──────┬───────┘
       ↓
┌──────────────┐
│ Get User DB  │
└──────┬───────┘
       ↓
┌──────────────┐
│ Check Perms  │
└──────┬───────┘
       ↓
┌──────────────┐
│   Process    │
└──────────────┘
```

### Security Layers

1. **Network Layer**
   - HTTPS/TLS encryption
   - DDoS protection (rate limiting)
   - IP whitelisting (admin routes)

2. **Application Layer**
   - Input validation
   - XSS prevention
   - CSRF protection
   - SQL/NoSQL injection prevention

3. **Data Layer**
   - Encrypted passwords (bcrypt)
   - Encrypted sensitive data
   - Access control
   - Audit logging

## Caching Strategy

### Cache Hierarchy

```
Request → Application Cache (in-memory)
       ↓ (if miss)
       → Redis Cache
       ↓ (if miss)
       → Database
```

### What We Cache

- User sessions (Redis)
- API responses (Redis, 5-30 min TTL)
- Static content (CDN)
- Database query results (Redis, 1 hour TTL)

## Scalability

### Horizontal Scaling

```
┌─────────────┐
│ Load        │
│ Balancer    │
└──────┬──────┘
       ↓
   ┌───┴────┬────────┬────────┐
   ↓        ↓        ↓        ↓
┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│ App  │ │ App  │ │ App  │ │ App  │
│ #1   │ │ #2   │ │ #3   │ │ #4   │
└──────┘ └──────┘ └──────┘ └──────┘
   ↓        ↓        ↓        ↓
   └────────┴────────┴────────┘
            ↓
     ┌──────────────┐
     │   MongoDB    │
     │   Cluster    │
     └──────────────┘
```

### Database Scaling

- MongoDB replica set (read scaling)
- Sharding (write scaling)
- Indexes on frequently queried fields
- Connection pooling

## Monitoring & Observability

### Metrics

- Request rate
- Response times
- Error rates
- CPU/Memory usage
- Database query performance

### Logging

```
Application Logs → Winston → Console/File
                           ↓
                      CloudWatch/ELK
```

### Error Tracking

```
Application Error → Sentry → Alert/Dashboard
```

## Technology Stack

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js 4.x
- **Language:** JavaScript (ES6+)

### Database
- **Primary:** MongoDB 6.0
- **Cache:** Redis 7.x
- **ORM:** Mongoose 8.x

### External Services
- **AI:** OpenAI GPT-4, Whisper, Vision
- **Storage:** AWS S3 / Cloudinary
- **Email:** SendGrid / SMTP
- **Monitoring:** Sentry

### DevOps
- **Containerization:** Docker
- **Orchestration:** Kubernetes
- **CI/CD:** GitHub Actions
- **Cloud:** AWS, Heroku, Vercel

## Design Patterns

### 1. MVC Pattern
- **Models:** Database schemas (Mongoose)
- **Views:** API responses (JSON)
- **Controllers:** Business logic handlers

### 2. Repository Pattern
- Database operations abstracted in models
- Service layer for complex operations

### 3. Middleware Pattern
- Chainable request/response processors
- Cross-cutting concerns (auth, logging, etc.)

### 4. Factory Pattern
- Service instantiation
- Configuration management

## API Design Principles

### RESTful Design
- Resource-based URLs
- HTTP methods (GET, POST, PUT, DELETE)
- Stateless communication
- JSON responses

### Versioning
- URL-based versioning (`/api/v1/`)
- Backward compatibility
- Deprecation notices

### Error Handling
- Consistent error format
- HTTP status codes
- Detailed error messages (dev mode)

## Performance Optimization

### Database
- Indexes on frequently queried fields
- Aggregation pipeline optimization
- Connection pooling
- Query result caching

### API
- Response compression (gzip/brotli)
- Pagination for large datasets
- Field filtering
- ETags for cache validation

### Frontend
- Code splitting
- Lazy loading
- Asset optimization
- CDN for static files

## Future Enhancements

- GraphQL API
- gRPC for microservices
- Event-driven architecture
- Machine learning model integration
- Mobile applications (iOS, Android)
- Progressive Web App (PWA)

## References

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

Last updated: 2024-01-15
