const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const serviceModels = new Map();

const serviceUserSchemaDefinition = {
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Invalid email"],
  },
  password: { type: String, required: true, minlength: 8, select: false },
  service: { type: String, required: true, immutable: true },
  refreshTokens: [
    {
      token: String,
      expires: Date,
      createdAt: { type: Date, default: Date.now },
    },
  ],
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },
  lastLogin: { type: Date },
  lastLoginIp: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
};

module.exports = function (serviceName) {
  if (!serviceName) throw new Error("Service name is required");

  const normalizedName = serviceName.toLowerCase().trim();

  if (serviceModels.has(normalizedName)) {
    return serviceModels.get(normalizedName);
  }

  const schema = new mongoose.Schema(serviceUserSchemaDefinition, {
    collection: `${normalizedName}_users`,
  });

  schema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  };

  // Check if user is locked
  schema.virtual("isLocked").get(function () {
    return !!(this.lockUntil && this.lockUntil > Date.now());
  });

  // Increment login attempts
  schema.methods.incLoginAttempts = function () {
    // If lock has expired, restart count
    if (this.lockUntil && this.lockUntil < Date.now()) {
      return this.updateOne({
        $set: { loginAttempts: 1 },
        $unset: { lockUntil: 1 },
      });
    }
    // Otherwise increment
    const updates = { $inc: { loginAttempts: 1 } };
    // Lock account after 5 failed attempts for 2 hours
    const maxAttempts = 5;
    const lockTime = 2 * 60 * 60 * 1000; // 2 hours
    if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked) {
      updates.$set = { lockUntil: Date.now() + lockTime };
    }
    return this.updateOne(updates);
  };

  // Reset login attempts on successful login
  schema.methods.resetLoginAttempts = function () {
    return this.updateOne({
      $set: { loginAttempts: 0 },
      $unset: { lockUntil: 1 },
    });
  };

  schema.pre("save", async function (next) {
    if (this.isModified("password")) {
      this.password = await bcrypt.hash(this.password, 12);
    }
    this.updatedAt = Date.now();
    next();
  });

  const modelName = `${
    normalizedName.charAt(0).toUpperCase() + normalizedName.slice(1)
  }User`;
  const Model = mongoose.model(modelName, schema);

  serviceModels.set(normalizedName, Model);
  return Model;
};
