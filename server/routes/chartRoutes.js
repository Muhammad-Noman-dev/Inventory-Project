const express = require("express");

const {
  getMonthlyReport,
  getTopProducts,
} = require("../controller/chartController");

const router = express.Router();

router.get("/monthly", getMonthlyReport);
router.get("/top-products", getTopProducts);

module.exports = router;