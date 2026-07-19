const express = require("express");

const {
  createPurchase,
  getPurchases,
} = require("../controller/purchaseController");

const router = express.Router();

router.post("/", createPurchase);
router.get("/", getPurchases);

module.exports = router;