const express = require("express");

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getCategorySummary,
  getProductsByCategory,
} = require("../controller/productController");

const router = express.Router();

// Create
router.post("/", createProduct);

// Get All Products
router.get("/", getProducts);

// Inventory Routes (IMPORTANT: id route se pehle)
router.get("/category-summary", getCategorySummary);
router.get("/category/:categoryId", getProductsByCategory);

// Single Product
router.get("/:id", getProductById);

// Update
router.put("/:id", updateProduct);

// Delete
router.delete("/:id", deleteProduct);

module.exports = router;