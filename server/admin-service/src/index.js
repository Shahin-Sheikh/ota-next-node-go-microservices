const express = require("express");
const dotenv = require("dotenv");
const sequelize = require("./config/db.config");
const productRoutes = require("./routes/product.routes");
const hotelsRoutes = require("./routes/hotels.routes");

dotenv.config();

const app = express();
app.use(express.json());

app.use("/api/products", productRoutes);
app.use("/api/hotels", hotelsRoutes);

const PORT = process.env.PORT || 3010;

sequelize.sync({ alter: true }).then(() => {
  console.log("Database synced");
  app.listen(PORT, () => {
    console.log(`Product Service running on port ${PORT}`);
  });
});
