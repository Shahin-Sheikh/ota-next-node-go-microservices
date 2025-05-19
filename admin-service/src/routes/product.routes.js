const express = require("express");
const router = express.Router();
const controller = require("../controllers/product.controller");
const authenticate = require("../middleware/auth.middleware");

router.get("/", authenticate, controller.getAllProducts);
router.post("/", authenticate, controller.createProduct);

module.exports = router;
