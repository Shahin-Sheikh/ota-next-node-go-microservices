const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
  },
  secret: {
    type: String,
    required: true,
    unique: true,
  },
});

module.exports = mongoose.model("Service", serviceSchema);
