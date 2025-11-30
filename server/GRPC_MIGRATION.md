# gRPC Migration Guide

This document outlines the steps to migrate from HTTP to gRPC for hotel service communication.

## Current Architecture

```
Customer Service (HTTP Client)
        ↓
    HTTP REST API
        ↓
    Hotel Service
```

## Future Architecture

```
Customer Service (gRPC Client)
        ↓
    gRPC Protocol
        ↓
    Hotel Service (gRPC Server)
```

## Migration Steps

### 1. Define Protocol Buffers (.proto files)

Create `hotel-service/proto/hotel.proto`:

```protobuf
syntax = "proto3";

package hotel;

service HotelService {
  rpc GetAllHotels(GetAllHotelsRequest) returns (GetAllHotelsResponse);
  rpc GetHotelById(GetHotelByIdRequest) returns (GetHotelByIdResponse);
  rpc SearchHotels(SearchHotelsRequest) returns (SearchHotelsResponse);
  rpc CreateHotel(CreateHotelRequest) returns (CreateHotelResponse);
  rpc UpdateHotel(UpdateHotelRequest) returns (UpdateHotelResponse);
  rpc UpdateHotelStatus(UpdateHotelStatusRequest) returns (UpdateHotelStatusResponse);
}

message Hotel {
  string id = 1;
  string name = 2;
  string description = 3;
  float starRating = 4;
  Location location = 5;
  Address address = 6;
  repeated string amenities = 7;
  repeated string images = 8;
  Policies policies = 9;
  Contact contact = 10;
  string status = 11;
  string createdBy = 12;
  string createdAt = 13;
  string updatedAt = 14;
  repeated Room rooms = 15;
}

message Location {
  string city = 1;
  string country = 2;
  Coordinates coordinates = 3;
}

message Coordinates {
  double lat = 1;
  double lng = 2;
}

message Address {
  string street = 1;
  string city = 2;
  string state = 3;
  string zipCode = 4;
}

message Policies {
  CheckInOut checkInOut = 1;
  string cancellation = 2;
  repeated string rules = 3;
}

message CheckInOut {
  string checkIn = 1;
  string checkOut = 2;
}

message Contact {
  string phone = 1;
  string email = 2;
  string website = 3;
}

message Room {
  string id = 1;
  string type = 2;
  int32 capacity = 3;
  double price = 4;
  repeated string amenities = 5;
  int32 available = 6;
}

message GetAllHotelsRequest {
  optional string status = 1;
  optional string searchKey = 2;
  optional int32 page = 3;
  optional int32 limit = 4;
}

message GetAllHotelsResponse {
  bool success = 1;
  repeated Hotel data = 2;
  Pagination pagination = 3;
}

message Pagination {
  int32 page = 1;
  int32 limit = 2;
  int32 total = 3;
  int32 pages = 4;
}

message GetHotelByIdRequest {
  string hotelId = 1;
}

message GetHotelByIdResponse {
  bool success = 1;
  Hotel data = 2;
  optional string error = 3;
}

message SearchHotelsRequest {
  optional string searchKey = 1;
  optional int32 page = 2;
  optional int32 limit = 3;
}

message SearchHotelsResponse {
  bool success = 1;
  repeated Hotel data = 2;
  Pagination pagination = 3;
}

message CreateHotelRequest {
  string name = 1;
  string description = 2;
  float starRating = 3;
  Location location = 4;
  Address address = 5;
  repeated string amenities = 6;
  Contact contact = 7;
}

message CreateHotelResponse {
  bool success = 1;
  Hotel data = 2;
}

message UpdateHotelRequest {
  string hotelId = 1;
  optional string name = 2;
  optional string description = 3;
  optional float starRating = 4;
  optional Location location = 5;
  optional Address address = 6;
  repeated string amenities = 7;
  optional Contact contact = 8;
}

message UpdateHotelResponse {
  bool success = 1;
  Hotel data = 2;
}

message UpdateHotelStatusRequest {
  string hotelId = 1;
  string status = 2;
}

message UpdateHotelStatusResponse {
  bool success = 1;
  string message = 2;
}
```

### 2. Install gRPC Dependencies

```bash
# Hotel Service
cd server/hotel-service
npm install @grpc/grpc-js @grpc/proto-loader

# Customer Service
cd server/customer-service
npm install @grpc/grpc-js @grpc/proto-loader
```

### 3. Generate Code (Optional)

If using TypeScript or static code generation:

```bash
npm install -g grpc-tools

# Generate JavaScript code
grpc_tools_node_protoc \
  --js_out=import_style=commonjs,binary:./src/generated \
  --grpc_out=grpc_js:./src/generated \
  --plugin=protoc-gen-grpc=`which grpc_tools_node_protoc_plugin` \
  proto/hotel.proto
```

### 4. Implement gRPC Server (Hotel Service)

Create `hotel-service/src/grpc/hotel.grpc.service.js`:

```javascript
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");
const db = require("../models");

const PROTO_PATH = path.join(__dirname, "../../proto/hotel.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const hotelProto = grpc.loadPackageDefinition(packageDefinition).hotel;

class HotelGrpcService {
  async getAllHotels(call, callback) {
    try {
      const {
        status = "active",
        searchKey,
        page = 1,
        limit = 50,
      } = call.request;
      // Implement logic similar to getAllHotelsPublic
      // ...
      callback(null, { success: true, data: hotels, pagination });
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message,
      });
    }
  }

  async getHotelById(call, callback) {
    try {
      const { hotelId } = call.request;
      // Implement logic
      // ...
      callback(null, { success: true, data: hotel });
    } catch (error) {
      callback({
        code: grpc.status.NOT_FOUND,
        message: error.message,
      });
    }
  }

  // Implement other methods...
}

function startGrpcServer() {
  const server = new grpc.Server();
  const service = new HotelGrpcService();

  server.addService(hotelProto.HotelService.service, {
    GetAllHotels: service.getAllHotels.bind(service),
    GetHotelById: service.getHotelById.bind(service),
    SearchHotels: service.searchHotels.bind(service),
    // Add other methods...
  });

  const port = process.env.GRPC_PORT || 50051;
  server.bindAsync(
    `0.0.0.0:${port}`,
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
      if (error) {
        console.error("gRPC server error:", error);
        return;
      }
      console.log(`✅ gRPC Server running on port ${port}`);
      server.start();
    }
  );

  return server;
}

module.exports = { startGrpcServer };
```

### 5. Replace HTTP Client (Customer Service)

Update `customer-service/src/services/hotel-service.client.js`:

```javascript
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const PROTO_PATH = path.join(__dirname, "../../proto/hotel.proto");
const GRPC_HOST = process.env.HOTEL_SERVICE_GRPC_HOST || "localhost:50051";

class HotelServiceClient {
  constructor() {
    const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });

    const hotelProto = grpc.loadPackageDefinition(packageDefinition).hotel;

    this.client = new hotelProto.HotelService(
      GRPC_HOST,
      grpc.credentials.createInsecure()
    );
  }

  async getAllHotels(params = {}) {
    return new Promise((resolve, reject) => {
      this.client.GetAllHotels(params, (error, response) => {
        if (error) {
          console.error("gRPC Error:", error.message);
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  async getHotelById(hotelId) {
    return new Promise((resolve, reject) => {
      this.client.GetHotelById({ hotelId }, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  // Implement other methods...

  async healthCheck() {
    try {
      // Implement gRPC health check
      return true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = new HotelServiceClient();
```

### 6. Update Service Initialization

**Hotel Service** (`index.js`):

```javascript
const { startGrpcServer } = require("./grpc/hotel.grpc.service");

// After HTTP server starts
db.sequelize.sync({ alter: true }).then(async () => {
  await connectProducer();

  // Start HTTP server
  const server = app.listen(PORT, () => {
    console.log(`🚀 Hotel Service HTTP running on port ${PORT}`);
  });

  // Start gRPC server
  startGrpcServer();
});
```

### 7. Update Environment Variables

```env
# Hotel Service
GRPC_PORT=50051

# Customer Service
HOTEL_SERVICE_GRPC_HOST=localhost:50051
```

### 8. Testing

```bash
# Install grpcurl for testing
brew install grpcurl  # macOS
# or
go install github.com/fullstorydev/grpcurl/cmd/grpcurl@latest

# Test gRPC endpoint
grpcurl -plaintext -d '{"page": 1, "limit": 10}' \
  localhost:50051 hotel.HotelService/GetAllHotels
```

## Benefits of gRPC

1. **Performance**: Binary protocol, faster than JSON
2. **Type Safety**: Protocol Buffers provide strong typing
3. **Streaming**: Support for bidirectional streaming
4. **Code Generation**: Auto-generate client/server code
5. **Language Agnostic**: Works with multiple languages
6. **Smaller Payload**: Binary format is more compact

## Migration Checklist

- [ ] Define `.proto` files
- [ ] Install gRPC dependencies
- [ ] Implement gRPC server in hotel-service
- [ ] Replace HTTP client in customer-service
- [ ] Update environment variables
- [ ] Test all endpoints
- [ ] Update API documentation
- [ ] Monitor performance improvements
- [ ] Gradual rollout (run both HTTP and gRPC in parallel)
- [ ] Deprecate HTTP endpoints after successful migration

## Backward Compatibility

During migration, you can run both HTTP and gRPC simultaneously:

- Keep existing HTTP endpoints for backward compatibility
- Add new gRPC endpoints
- Update clients gradually
- Monitor both protocols
- Deprecate HTTP after full migration

## Resources

- [gRPC Documentation](https://grpc.io/docs/)
- [Protocol Buffers Guide](https://developers.google.com/protocol-buffers)
- [Node.js gRPC](https://grpc.io/docs/languages/node/)
