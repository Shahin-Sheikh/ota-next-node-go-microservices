const express = require("express");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
app.use(express.json());

// Load all models and setup associations
const db = require("./models"); // This automatically loads and associates models

// Load routes
const customerRoutes = require("./routes/customer.route");
app.use("/api", customerRoutes);

// Server
const PORT = process.env.PORT;

db.sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Database synced");
    app.listen(PORT, () => {
      console.log(`Product Service running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);
  });
