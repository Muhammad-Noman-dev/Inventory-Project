const Invoice = require("../model/Invoice");
const Product = require("../model/Product");

// =======================
// MONTHLY SALES & PROFIT
// =======================
const getMonthlyReport = async (req, res) => {
  try {
    const invoices = await Invoice.find();

    let monthlyData = {};

    invoices.forEach((inv) => {
      const month = new Date(inv.createdAt).toLocaleString("default", {
        month: "short",
        year: "numeric",
      });

      if (!monthlyData[month]) {
        monthlyData[month] = {
          sales: 0,
          profit: 0,
        };
      }

      monthlyData[month].sales += inv.grandTotal;

      // profit = simple estimation (you can improve later)
      monthlyData[month].profit += inv.subTotal - inv.grandTotal;
    });

    return res.status(200).json({
      success: true,
      data: monthlyData,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};



// =======================
// TOP SELLING PRODUCTS
// =======================
const getTopProducts = async (req, res) => {
  try {
    const products = await Product.find();

    const sorted = products
      .map((p) => ({
        name: p.name,
        sold: p.stockOut,
      }))
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);

    return res.status(200).json({
      success: true,
      data: sorted,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};

module.exports = {
  getMonthlyReport,
  getTopProducts,
};