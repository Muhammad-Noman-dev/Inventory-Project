const express = require("express");

const {
  stockIn,
  stockOut,
  getStockHistory,
  getProfitReport,
  getLowStockProducts, getOutOfStockProducts, deleteStockHistory,
} = require("../controller/stockController");

const router = express.Router();

router.post("/in", stockIn);
router.post("/out", stockOut);
router.get("/history", getStockHistory);
router.get("/profit", getProfitReport);
router.get("/low-stock", getLowStockProducts);
router.get("/out-of-stock", getOutOfStockProducts);
router.delete("/history/:id", deleteStockHistory);

module.exports = router;