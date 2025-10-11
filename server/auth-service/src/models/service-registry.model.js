const mongoose = require("mongoose");

const serviceRegistrySchema = new mongoose.Schema({
  serviceName: {
    type: String,
    required: true,
    unique: true,
    enum: ["admin", "hotel", "crm"],
  },
  serviceSecret: {
    type: String,
    required: true,
    select: false,
  },
  allowedDomains: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("ServiceRegistry", serviceRegistrySchema);
