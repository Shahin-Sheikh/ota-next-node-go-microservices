# Quick Start Guide - Hotel & Customer Service Integration

## Prerequisites

- Node.js (v16+)
- Docker & Docker Compose
- PostgreSQL (for hotel-service)
- SQL Server (for customer-service)

## Step 1: Start Kafka

```bash
# From project root
docker-compose -f docker-compose.kafka.yml up -d

# Verify Kafka is running
docker ps
```

Access Kafka UI at: http://localhost:8080

## Step 2: Configure Environment Variables

### Hotel Service

```bash
cd server/hotel-service
cp .env.example .env
# Edit .env with your database credentials
```

### Customer Service

```bash
cd server/customer-service
cp .env.example .env
# Edit .env with your database credentials
# Ensure HOTEL_SERVICE_URL=http://localhost:5003
```

## Step 3: Start Services

### Terminal 1 - Hotel Service

```bash
cd server/hotel-service
npm install
npm run dev
```

Expected output:

```
✅ Kafka Producer connected
🚀 Hotel Service running on port 5003
📚 API Documentation: http://localhost:5003/api-docs
```

### Terminal 2 - Customer Service

```bash
cd server/customer-service
npm install
npm run dev
```

Expected output:

```
✅ Kafka Consumer connected
✅ Kafka Consumer started listening to hotel events
🚀 Customer Service running on port 5002
📚 API Documentation: http://localhost:5002/api-docs
```

## Step 4: Test the Integration

### 4.1 Create a Hotel (Hotel Service)

```bash
curl -X POST http://localhost:5003/api/hotels \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Luxury Grand Hotel",
    "description": "5-star luxury hotel in downtown",
    "starRating": 5,
    "location": {
      "city": "New York",
      "country": "USA",
      "coordinates": {
        "lat": 40.7589,
        "lng": -73.9851
      }
    },
    "address": {
      "street": "123 Fifth Avenue",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001"
    },
    "amenities": ["WiFi", "Pool", "Spa", "Restaurant", "Parking"],
    "contact": {
      "phone": "+1-555-0123",
      "email": "info@luxurygrand.com"
    },
    "status": "active"
  }'
```

Check the logs - you should see:

```
📤 Hotel created event published: [hotel-id]
```

### 4.2 Get Hotels via Customer Service

```bash
curl http://localhost:5002/api/hotels/list
```

Response:

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1,
    "pages": 1
  }
}
```

### 4.3 Search Hotels

```bash
curl "http://localhost:5002/api/hotels/search/query?searchKey=luxury"
```

### 4.4 Get Hotel by ID

```bash
curl http://localhost:5002/api/hotels/[hotel-id]
```

### 4.5 Update Hotel (triggers Kafka event)

```bash
curl -X PUT http://localhost:5003/api/hotels/[hotel-id] \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "description": "Updated description"
  }'
```

Check customer-service logs:

```
📥 Received event: hotel.updated - HOTEL_UPDATED
Processing hotel updated event: [hotel-id]
```

### 4.6 Check Hotel Service Health

```bash
curl http://localhost:5002/api/hotels/health/check
```

## API Documentation

- Hotel Service: http://localhost:5003/api-docs
- Customer Service: http://localhost:5002/api-docs
- Kafka UI: http://localhost:8080

## Monitoring Kafka Events

### View Topics

In Kafka UI (http://localhost:8080):

- Navigate to "Topics"
- You should see:
  - `hotel.created`
  - `hotel.updated`
  - `hotel.status.changed`
  - `hotel.deleted`

### View Messages

- Click on any topic
- Go to "Messages" tab
- See published events in real-time

## Troubleshooting

### Kafka Connection Issues

```bash
# Check if Kafka is running
docker ps | grep kafka

# Check Kafka logs
docker logs kafka

# Restart Kafka
docker-compose -f docker-compose.kafka.yml restart
```

### Hotel Service Not Reachable

```bash
# Check if hotel-service is running
curl http://localhost:5003/health

# Check logs
# Look for any error messages in terminal
```

### Database Connection Issues

```bash
# Verify database is running and accessible
# Check .env file credentials
```

## Stopping Services

```bash
# Stop Node services: Ctrl+C in each terminal

# Stop Kafka
docker-compose -f docker-compose.kafka.yml down

# Stop Kafka and remove volumes
docker-compose -f docker-compose.kafka.yml down -v
```

## Next Steps

1. **Authentication**: Set up proper JWT tokens for hotel-service admin endpoints
2. **Caching**: Implement Redis cache in customer-service for hotel data
3. **gRPC Migration**: Replace HTTP client with gRPC when ready
4. **Monitoring**: Add Prometheus/Grafana for metrics
5. **Load Testing**: Test with multiple concurrent requests
6. **Error Handling**: Enhance error responses and retry logic

## Architecture Highlights

✅ **Microservices Pattern**: Separate services for different domains
✅ **Event-Driven**: Kafka for asynchronous communication
✅ **HTTP REST**: Simple request/response for queries
✅ **Future-Ready**: Easy migration path to gRPC
✅ **Scalable**: Can add more consumers/producers as needed
✅ **Resilient**: Services can operate independently

For detailed documentation, see: [HOTEL_INTEGRATION.md](./HOTEL_INTEGRATION.md)
