const express = require("express");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
app.use(express.json());

// Load all models and setup associations
const db = require("./models"); // This automatically loads and associates models

// Load routes
const hotelsRoutes = require("./routes/hotels.routes");
app.use("/api/hotels", hotelsRoutes);

// Server
const PORT = process.env.PORT;

app.get("/", (req, res) => {
  res.send("Hotel Service Running");
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: "Internal Server Error",
  });
});

// db.sequelize
//   .sync({ alter: true })
//   .then(() => {
//     app.listen(PORT, () => {
//       console.log(`Hotel Service running on port ${PORT}`);
//     });
//   })
//   .catch((err) => {
//     console.error("Database connection failed:", err.message);
//   });

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
