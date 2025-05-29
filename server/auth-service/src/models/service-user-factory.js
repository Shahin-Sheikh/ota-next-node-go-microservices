const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Cache for already created models
const serviceModels = {};

const serviceUserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    roles: {
      type: [String],
      default: ["user"],
    },
    refreshTokens: [
      {
        token: String,
        expires: Date,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: function () {
      return `${this.service}_users`;
    },
  }
);

// Schema methods and hooks
serviceUserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.updatedAt = Date.now();
  next();
});

serviceUserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = function (serviceName) {
  if (!serviceModels[serviceName]) {
    const modelName = `${
      serviceName.charAt(0).toUpperCase() + serviceName.slice(1)
    }User`;
    const collectionName = `${serviceName}_users`;
    serviceModels[serviceName] = mongoose.model(
      modelName,
      serviceUserSchema,
      collectionName
    );
  }
  return serviceModels[serviceName];
};
