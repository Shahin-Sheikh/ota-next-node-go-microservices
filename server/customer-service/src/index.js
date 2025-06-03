const express = require("express");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
app.use(express.json());

// Load routes
const customerRoutes = require("./routes/customer.route");
app.use("/api", customerRoutes);

// Server
const PORT = process.env.PORT;

app.get("/", (req, res) => {
  res.send("Authentication Service Running");
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
