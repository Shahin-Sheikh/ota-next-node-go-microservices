// utils/client-call/index.js
const http = require("../http-call");
const grpc = require("../grpc-call");

module.exports = {
  http,
  grpc,
  // Add other protocols (WebSocket, etc.) here
};
