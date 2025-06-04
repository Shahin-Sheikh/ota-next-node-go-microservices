// utils/grpc-call/index.js
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const PROTO_PATH = __dirname + "/../../protos/hotel_service.proto";

const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const hotelProto = grpc.loadPackageDefinition(packageDefinition).hotel;

const client = new hotelProto.HotelService(
  process.env.GRPC_SERVICE_URL,
  grpc.credentials.createInsecure()
);

module.exports = {
  searchHotels: (params) =>
    new Promise((resolve, reject) => {
      client.searchHotels(params, (err, response) => {
        if (err) reject(err);
        else resolve(response);
      });
    }),
  // Add more gRPC methods here
};
