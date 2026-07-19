// =======================
// Models
// =======================
const Product = require("../model/Product");
const Category = require("../model/Category");
const Invoice = require("../model/Invoice");

// =======================
// Dashboard
// =======================
const getDashboard = async (req, res) => {
  try {
    // =======================
    // Dates
    // =======================
    const now = new Date();

    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    const startOfYear = new Date(
      now.getFullYear(),
      0,
      1
    );

    // =======================
    // Product Data
    // =======================
    const totalProducts = await Product.countDocuments();
    const totalCategories = await Category.countDocuments();

    const products = await Product.find();

    let totalStock = 0;
    let lowStockProducts = [];
    let topSellingProducts = [];

    products.forEach((product) => {
      totalStock += product.stock;

      if (product.stock <= 5) {
        lowStockProducts.push(product);
      }

      topSellingProducts.push({
        name: product.name,
        sold: product.stockOut,
      });
    });

    topSellingProducts.sort((a, b) => b.sold - a.sold);

    // =======================
    // Invoice Data
    // =======================
    const todayInvoices = await Invoice.find({
      createdAt: { $gte: startOfDay },
    });

    const monthInvoices = await Invoice.find({
      createdAt: { $gte: startOfMonth },
    });

    const yearInvoices = await Invoice.find({
      createdAt: { $gte: startOfYear },
    });

    // =======================
    // Sales
    // =======================
    const todaySales = todayInvoices.reduce(
      (sum, invoice) => sum + invoice.grandTotal,
      0
    );

    const monthSales = monthInvoices.reduce(
      (sum, invoice) => sum + invoice.grandTotal,
      0
    );

    const yearSales = yearInvoices.reduce(
      (sum, invoice) => sum + invoice.grandTotal,
      0
    );

    // =======================
    // Profit
    // =======================
    let todayProfit = 0;
    let monthProfit = 0;
    let yearProfit = 0;

    todayInvoices.forEach((invoice) => {
      invoice.products.forEach((item) => {
        todayProfit += item.profit;
      });
    });

    monthInvoices.forEach((invoice) => {
      invoice.products.forEach((item) => {
        monthProfit += item.profit;
      });
    });

    yearInvoices.forEach((invoice) => {
      invoice.products.forEach((item) => {
        yearProfit += item.profit;
      });
    });

    // =======================
    // Response
    // =======================
    return res.status(200).json({
      success: true,

      totalProducts,
      totalCategories,
      totalStock,

      todaySales,
      monthSales,
      yearSales,

      todayProfit,
      monthProfit,
      yearProfit,

      lowStockProducts,

      topSellingProducts: topSellingProducts.slice(0, 5),
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};

module.exports = {
  getDashboard,
};