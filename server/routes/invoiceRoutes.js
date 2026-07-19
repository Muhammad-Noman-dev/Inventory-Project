const express = require("express");
const {
  createInvoice,
  getInvoices,
  getInvoicePDF,
  deleteInvoice,
  getInvoiceById,
  updateInvoice,
} = require("../controller/invoiceController");

const router = express.Router();

router.post("/", createInvoice);
router.get("/", getInvoices);
router.get("/:id/pdf", getInvoicePDF);
router.get("/:id", getInvoiceById);
router.put("/:id", updateInvoice);
router.delete("/:id", deleteInvoice);

module.exports = router;