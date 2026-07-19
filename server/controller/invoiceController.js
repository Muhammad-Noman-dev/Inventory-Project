


const Invoice = require("../model/Invoice");
const Product = require("../model/Product");
const Customer = require("../model/Customer");
const generateInvoicePDF = require("../utils/generateInvoicePDF");
const logStockHistory = require("../utils/logStockHistory");

const generateInvoiceNumber = () => {
  return `INV-${Date.now()}`;
};

const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const roundMoney = (value) => {
  return Math.round(toNumber(value) * 100) / 100;
};

const createError = (status, msg) => {
  const error = new Error(msg);
  error.status = status;
  return error;
};

const getActionBy = (req) => {
  return req.admin?._id || req.user?._id;
};

const parseInvoiceDate = (date) => {
  if (!date) return new Date();

  const parsedDate = new Date(date);
  return Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
};

const getOldQuantityMap = (invoice) => {
  const map = new Map();

  if (!invoice?.products) return map;

  invoice.products.forEach((item) => {
    const productId = String(item.product);
    const currentQuantity = toNumber(map.get(productId));
    map.set(productId, currentQuantity + toNumber(item.quantity));
  });

  return map;
};

const buildInvoiceData = async (products, discount = 0, oldQuantityMap = new Map()) => {
  if (!Array.isArray(products) || products.length === 0) {
    throw createError(400, "At least one product is required");
  }

  const rows = [];
  let subTotal = 0;
  let totalCost = 0;

  for (const item of products) {
    const productId = item.product || item.productId;
    const quantity = toNumber(item.quantity || item.qty);

    if (!productId) {
      throw createError(400, "Product ID is required");
    }

    if (quantity <= 0) {
      throw createError(400, "Product quantity must be greater than 0");
    }

    const product = await Product.findById(productId);

    if (!product) {
      throw createError(404, "Product not found");
    }

    const availableStock =
      toNumber(product.stock) + toNumber(oldQuantityMap.get(String(product._id)));

    if (availableStock < quantity) {
      throw createError(400, `Insufficient stock for ${product.name}`);
    }

    const costPrice = roundMoney(product.costPrice);
    const price = roundMoney(product.sellingPrice);
    const lineTotal = roundMoney(price * quantity);
    const costTotal = roundMoney(costPrice * quantity);

    rows.push({
      productDoc: product,
      invoiceItem: {
        product: product._id,
        name: product.name,
        sku: product.sku || "",
        quantity,
        costPrice,
        price,
        costTotal,
        discountShare: 0,
        total: lineTotal,
        profit: 0,
      },
    });

    subTotal = roundMoney(subTotal + lineTotal);
    totalCost = roundMoney(totalCost + costTotal);
  }

  const safeDiscount = Math.min(Math.max(roundMoney(discount), 0), subTotal);
  const grandTotal = roundMoney(subTotal - safeDiscount);
  const totalProfit = roundMoney(grandTotal - totalCost);

  let allocatedDiscount = 0;

  const invoiceProducts = rows.map((row, index) => {
    const isLastItem = index === rows.length - 1;

    const discountShare = isLastItem
      ? roundMoney(safeDiscount - allocatedDiscount)
      : roundMoney(safeDiscount * (row.invoiceItem.total / subTotal));

    allocatedDiscount = roundMoney(allocatedDiscount + discountShare);

    return {
      ...row.invoiceItem,
      discountShare,
      profit: roundMoney(
        row.invoiceItem.total - discountShare - row.invoiceItem.costTotal
      ),
    };
  });

  return {
    rows,
    invoiceProducts,
    subTotal,
    discount: safeDiscount,
    grandTotal,
    totalCost,
    totalProfit,
  };
};

const applyStockOut = async (rows, invoiceProducts, actionBy, reason) => {
  for (let index = 0; index < rows.length; index++) {
    const product = rows[index].productDoc;
    const item = invoiceProducts[index];

    const previousStock = toNumber(product.stock);

    product.stock = previousStock - item.quantity;
    product.stockOut = toNumber(product.stockOut) + item.quantity;
    product.totalProfit = roundMoney(toNumber(product.totalProfit) + item.profit);

    await product.save();

    await logStockHistory({
      product: product._id,
      type: "OUT",
      quantity: item.quantity,
      previousStock,
      newStock: product.stock,
      reason,
      actionBy,
    });
  }
};

const restoreInvoiceStock = async (invoice, actionBy, reason) => {
  for (const item of invoice.products) {
    const product = await Product.findById(item.product);

    if (!product) continue;

    const previousStock = toNumber(product.stock);

    product.stock = previousStock + toNumber(item.quantity);
    product.stockOut = Math.max(0, toNumber(product.stockOut) - toNumber(item.quantity));
    product.totalProfit = roundMoney(toNumber(product.totalProfit) - toNumber(item.profit));

    await product.save();

    await logStockHistory({
      product: product._id,
      type: "IN",
      quantity: item.quantity,
      previousStock,
      newStock: product.stock,
      reason,
      actionBy,
    });
  }
};

const createInvoice = async (req, res) => {
  try {
    const {
      customerName,
      customerPhone = "",
      date,
      products,
      discount = 0,
    } = req.body;

    if (!customerName || !products || products.length === 0) {
      return res.status(400).json({
        success: false,
        msg: "Customer and products required",
      });
    }

    const invoiceDate = parseInvoiceDate(date);

    const invoiceData = await buildInvoiceData(products, discount);

    await applyStockOut(
      invoiceData.rows,
      invoiceData.invoiceProducts,
      getActionBy(req),
      "Sale (Invoice)"
    );

    const invoice = await Invoice.create({
      invoiceNumber: generateInvoiceNumber(),
      date: invoiceDate,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      products: invoiceData.invoiceProducts,
      subTotal: invoiceData.subTotal,
      discount: invoiceData.discount,
      grandTotal: invoiceData.grandTotal,
      totalCost: invoiceData.totalCost,
      totalProfit: invoiceData.totalProfit,
    });

    if (customerPhone) {
      let customer = await Customer.findOne({ phone: customerPhone });

      if (!customer) {
        customer = await Customer.create({
          name: customerName,
          phone: customerPhone,
        });
      }

      customer.totalPurchases = toNumber(customer.totalPurchases) + 1;
      customer.totalSpent = roundMoney(toNumber(customer.totalSpent) + invoiceData.grandTotal);

      await customer.save();
    }

    return res.status(201).json({
      success: true,
      msg: "Invoice created successfully",
      invoice,
    });
  } catch (error) {
    console.error(error);

    return res.status(error.status || 500).json({
      success: false,
      msg: error.message,
    });
  }
};

const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate("products.product", "name sku costPrice sellingPrice")
      .sort({ date: -1 });

    return res.status(200).json({
      success: true,
      invoices,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};

const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate(
      "products.product",
      "name sku costPrice sellingPrice"
    );

    if (!invoice) {
      return res.status(404).json({
        success: false,
        msg: "Invoice not found",
      });
    }

    return res.status(200).json({
      success: true,
      invoice,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};

const getInvoicePDF = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate(
      "products.product",
      "name sku costPrice sellingPrice"
    );

    if (!invoice) {
      return res.status(404).json({
        success: false,
        msg: "Invoice not found",
      });
    }

    generateInvoicePDF(invoice, res);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};

const updateInvoice = async (req, res) => {
  try {
    const {
      customerName,
      customerPhone = "",
      date,
      products,
      discount = 0,
    } = req.body;

    if (!customerName || !products || products.length === 0) {
      return res.status(400).json({
        success: false,
        msg: "Customer and products required",
      });
    }

    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        msg: "Invoice not found",
      });
    }

    const oldQuantityMap = getOldQuantityMap(invoice);

    const invoiceData = await buildInvoiceData(products, discount, oldQuantityMap);

    await restoreInvoiceStock(
      invoice,
      getActionBy(req),
      "Invoice Edited (Old Stock Restored)"
    );

    await applyStockOut(
      invoiceData.rows,
      invoiceData.invoiceProducts,
      getActionBy(req),
      "Invoice Edited (New Stock Applied)"
    );

    if (invoice.customerPhone) {
      const oldCustomer = await Customer.findOne({ phone: invoice.customerPhone });

      if (oldCustomer) {
        oldCustomer.totalSpent = Math.max(
          0,
          roundMoney(toNumber(oldCustomer.totalSpent) - toNumber(invoice.grandTotal))
        );

        if (customerPhone !== invoice.customerPhone) {
          oldCustomer.totalPurchases = Math.max(
            0,
            toNumber(oldCustomer.totalPurchases) - 1
          );
        }

        await oldCustomer.save();
      }
    }

    if (customerPhone) {
      let customer = await Customer.findOne({ phone: customerPhone });

      if (!customer) {
        customer = await Customer.create({
          name: customerName,
          phone: customerPhone,
        });
      }

      if (customerPhone !== invoice.customerPhone) {
        customer.totalPurchases = toNumber(customer.totalPurchases) + 1;
      }

      customer.totalSpent = roundMoney(
        toNumber(customer.totalSpent) + invoiceData.grandTotal
      );

      await customer.save();
    }

    invoice.customerName = customerName.trim();
    invoice.customerPhone = customerPhone.trim();
    invoice.date = parseInvoiceDate(date || invoice.date);
    invoice.products = invoiceData.invoiceProducts;
    invoice.subTotal = invoiceData.subTotal;
    invoice.discount = invoiceData.discount;
    invoice.grandTotal = invoiceData.grandTotal;
    invoice.totalCost = invoiceData.totalCost;
    invoice.totalProfit = invoiceData.totalProfit;

    await invoice.save();

    return res.status(200).json({
      success: true,
      msg: "Invoice updated successfully",
      invoice,
    });
  } catch (error) {
    console.error(error);

    return res.status(error.status || 500).json({
      success: false,
      msg: error.message,
    });
  }
};

const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        msg: "Invoice not found",
      });
    }

    await restoreInvoiceStock(
      invoice,
      getActionBy(req),
      "Invoice Deleted (Stock Restored)"
    );

    if (invoice.customerPhone) {
      const customer = await Customer.findOne({ phone: invoice.customerPhone });

      if (customer) {
        customer.totalPurchases = Math.max(0, toNumber(customer.totalPurchases) - 1);
        customer.totalSpent = Math.max(
          0,
          roundMoney(toNumber(customer.totalSpent) - toNumber(invoice.grandTotal))
        );

        await customer.save();
      }
    }

    await Invoice.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      msg: "Invoice deleted and stock restored",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};

module.exports = {
  createInvoice,
  getInvoices,
  getInvoiceById,
  getInvoicePDF,
  updateInvoice,
  deleteInvoice,
};