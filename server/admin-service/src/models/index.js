// models/index.js
const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const sequelize = require("../config/db.config");

const db = {};

// Dynamically import all models
fs.readdirSync(__dirname)
  .filter((file) => file !== "index.js" && file.endsWith(".model.js"))
  .forEach((file) => {
    const model = require(path.join(__dirname, file));
    db[model.name] = model;
  });

// Run associate() for each model
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db); // <== Important
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
