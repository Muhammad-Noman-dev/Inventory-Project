const express = require("express");
const { getDashboard } = require("../controller/analyticsController");

const router = express.Router();

router.get("/dashboard", getDashboard);

module.exports = router;