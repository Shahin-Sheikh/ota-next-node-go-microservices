const express = require("express");
const router = express.Router();
const controller = require("../controllers/search.controller");
const authenticate = require("../middleware/auth.middleware");

router.get("/search", authenticate, controller.searchHotels);

module.exports = router;
