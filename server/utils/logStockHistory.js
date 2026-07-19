const StockHistory = require("../model/StockHistory");

const logStockHistory = async ({
  product,
  type,
  quantity,
  previousStock,
  newStock,
  reason,
  actionBy,
}) => {
  try {
    await StockHistory.create({
      product,
      type,
      quantity,
      previousStock,
      newStock,
      reason,
      actionBy,
    });
  } catch (error) {
    console.log("Stock History Error:", error.message);
  }
};

module.exports = logStockHistory;