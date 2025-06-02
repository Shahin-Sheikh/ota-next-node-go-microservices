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
