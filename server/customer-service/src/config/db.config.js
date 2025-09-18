const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME || "master",
  process.env.DB_USER || "SA",
  process.env.DB_PASSWORD || "Shahin@885",
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "mssql",
    port: process.env.DB_PORT || 1433,
    logging: false,
    dialectOptions: {
      options: {
        encrypt: false, // Use this if you're on Windows Azure
        trustServerCertificate: true, // Use this if you have self-signed certificate
      },
    },
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error);
  }
};

module.exports = connectDB;
module.exports.sequelize = sequelize;
