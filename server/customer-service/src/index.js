const dotenv = require("dotenv");
const express = require("express");
const connectDB = require("./config/db.config");

dotenv.config();

const PORT = process.env.PORT;

// Initialize Express app
const app = express();

// Connect to the database
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Load routes
const customerRoutes = require("./routes/customer.route");
app.use("/api/customers", customerRoutes);

// Test route
app.get("/hello", (req, res) => {
  res.send("Customer Service Running");
});

app.get("/", (req, res) => {
  res.send("Customer Service Running");
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

// Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
