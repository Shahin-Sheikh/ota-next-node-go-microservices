const mongoose = require("mongoose");

const UserServiceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
    required: true,
  },
  serviceSecret: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index to ensure one user-service combination
UserServiceSchema.index({ user: 1, service: 1 }, { unique: true });

module.exports = mongoose.model("UserService", UserServiceSchema);
