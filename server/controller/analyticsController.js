const Invoice = require("../model/Invoice");
const Product = require("../model/Product");



const getDashboard = async (req, res) => {
  try {
    console.log("Analytics Controller Called");
    const now = new Date();

    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    // Current Month Invoices
    const monthInvoices = await Invoice.find({
      createdAt: { $gte: startOfMonth }
    });

    // Monthly Sales
    const monthSales = monthInvoices.reduce(
      (sum, invoice) => sum + invoice.grandTotal,
      0
    );

    // Monthly Profit
   let monthProfit = 0;

monthInvoices.forEach((invoice) => {
  invoice.products.forEach((item) => {
    monthProfit += Number(item.profit || 0);
  });
});

console.log("Month Profit:", monthProfit);




    // Invoice Count
    const totalInvoicesThisMonth = monthInvoices.length;

    // Top Products
    const productMap = {};

    monthInvoices.forEach((invoice) => {
      invoice.products.forEach((item) => {

        if (!productMap[item.name]) {
          productMap[item.name] = {
            name: item.name,
            sales: 0,
            revenue: 0
          };
        }

        productMap[item.name].sales += item.quantity;
        productMap[item.name].revenue += item.total;

      });
    });

    const topProducts = Object.values(productMap)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);

    res.status(200).json({
      success: true,

      monthSales,

      monthProfit,

      totalInvoicesThisMonth,

      topProducts,

      topCustomers: []
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

module.exports = {
  getDashboard
};