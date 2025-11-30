# Hotel Service & Customer Service Integration

This document describes the integration between Customer Service and Hotel Service using HTTP calls and Kafka message broker.

## Overview

- **Hotel Service**: Manages hotel CRUD operations (create, update, modify, activate/deactivate)
- **Customer Service**: Fetches hotel list via HTTP calls to Hotel Service
- **Message Broker**: Kafka is used for event-driven communication
- **Future-Ready**: Architecture designed for easy migration to gRPC

## Architecture

### HTTP Communication

Customer Service makes HTTP calls to Hotel Service to fetch hotel data:

- `GET /api/hotels/public/list` - Get all active hotels
- `GET /api/hotels/public/:id` - Get hotel by ID
- `GET /api/hotels/search/all` - Search hotels

### Kafka Event Publishing (Hotel Service)

Hotel Service publishes events to Kafka topics when:

- **hotel.created**: New hotel is created
- **hotel.updated**: Hotel information is updated
- **hotel.status.changed**: Hotel status changes (active/inactive)
- **hotel.deleted**: Hotel is deleted

### Kafka Event Consumption (Customer Service)

Customer Service consumes hotel events from Kafka for:

- Cache invalidation
- Local data synchronization
- Real-time updates

## Setup Instructions

### 1. Environment Variables

#### Hotel Service (.env)

```env
PORT=5003
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hotel_db
DB_USER=your_user
DB_PASSWORD=your_password

# Kafka
KAFKA_BROKERS=localhost:9092

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:5174
```

#### Customer Service (.env)

```env
PORT=5002
NODE_ENV=development

# Database (your existing config)
DB_HOST=localhost
DB_NAME=customer_db

# Kafka
KAFKA_BROKERS=localhost:9092

# Hotel Service
HOTEL_SERVICE_URL=http://localhost:5003

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:5174
```

### 2. Install Dependencies

Both services now have KafkaJS installed:

```bash
cd server/hotel-service
npm install

cd ../customer-service
npm install
```

### 3. Run Kafka

Make sure Kafka is running on your local machine or update `KAFKA_BROKERS` in .env files:

```bash
# Using Docker Compose (example)
docker-compose up -d zookeeper kafka

# Or using local Kafka installation
# Start Zookeeper
bin/zookeeper-server-start.sh config/zookeeper.properties

# Start Kafka
bin/kafka-server-start.sh config/server.properties
```

### 4. Start Services

```bash
# Terminal 1 - Hotel Service
cd server/hotel-service
npm run dev

# Terminal 2 - Customer Service
cd server/customer-service
npm run dev
```

## API Endpoints

### Hotel Service

#### Admin Endpoints (Protected)

- `POST /api/hotels` - Create hotel
- `GET /api/hotels` - Get all hotels (admin)
- `GET /api/hotels/:id` - Get hotel by ID (admin)
- `PUT /api/hotels/:id` - Update hotel
- `PATCH /api/hotels/:id/activate` - Activate hotel
- `PATCH /api/hotels/:id/deactivate` - Deactivate hotel

#### Public Endpoints

- `GET /api/hotels/public/list` - Get all active hotels (public)
- `GET /api/hotels/public/:id` - Get hotel by ID (public)
- `GET /api/hotels/search/all` - Search hotels

### Customer Service

#### Hotel Integration Endpoints

- `GET /api/hotels/list` - Get all hotels (proxied from hotel-service)
- `GET /api/hotels/:hotelId` - Get hotel by ID
- `GET /api/hotels/search/query` - Search hotels
- `GET /api/hotels/health/check` - Check hotel service availability

## Code Structure

### Hotel Service

```
src/
├── config/
│   └── kafka.config.js          # Kafka configuration
├── controllers/
│   └── hotels.controller.js     # Hotel CRUD + Kafka publishing
├── services/
│   └── kafka-producer.service.js # Kafka event publisher
└── routes/
    └── hotels.routes.js         # Hotel routes
```

### Customer Service

```
src/
├── config/
│   └── kafka.config.js            # Kafka configuration
├── controllers/
│   └── hotel.controller.js        # Hotel proxy controller
├── services/
│   ├── hotel-service.client.js   # HTTP client for hotel-service
│   └── kafka-consumer.service.js # Kafka event consumer
└── routes/
    └── hotel.route.js            # Hotel proxy routes
```

## Migration to gRPC

The architecture is designed for easy migration to gRPC:

1. **Service Client Pattern**: `hotel-service.client.js` encapsulates all communication logic
2. **Interface Consistency**: Methods maintain consistent signatures
3. **Future Steps**:
   - Define `.proto` files for hotel service
   - Generate gRPC client/server code
   - Replace HTTP client implementation in `hotel-service.client.js`
   - Keep the same interface and controller logic

## Kafka Topics

| Topic                  | Producer      | Consumer         | Description          |
| ---------------------- | ------------- | ---------------- | -------------------- |
| `hotel.created`        | Hotel Service | Customer Service | New hotel created    |
| `hotel.updated`        | Hotel Service | Customer Service | Hotel info updated   |
| `hotel.status.changed` | Hotel Service | Customer Service | Hotel status changed |
| `hotel.deleted`        | Hotel Service | Customer Service | Hotel deleted        |

## Testing

### Test Hotel Creation with Kafka Event

```bash
curl -X POST http://localhost:5003/api/hotels \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Grand Hotel",
    "description": "Luxury hotel in downtown",
    "starRating": 5,
    "location": {"city": "New York", "country": "USA"},
    "status": "active"
  }'
```

### Test Hotel List from Customer Service

```bash
curl http://localhost:5002/api/hotels/list
```

### Test Hotel Service Health

```bash
curl http://localhost:5002/api/hotels/health/check
```

## Notes

- Kafka events are published asynchronously (non-blocking)
- Customer service can function without Kafka (HTTP calls are independent)
- All Kafka operations include error handling
- Graceful shutdown ensures Kafka connections are properly closed
- Hotel Service requires authentication for admin operations
- Public endpoints are available without authentication for customer service integration

## Monitoring

Check console logs for:

- ✅ Kafka Producer/Consumer connected
- 📤 Hotel events published
- 📥 Hotel events received

## Troubleshooting

1. **Kafka Connection Failed**: Ensure Kafka is running and `KAFKA_BROKERS` is correct
2. **Hotel Service Unavailable**: Check if hotel-service is running on port 5003
3. **Database Errors**: Verify database connection and migrations
