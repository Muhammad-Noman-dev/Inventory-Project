const Stock = require("../model/Stock");
const Product = require("../model/Product");

// =======================
// STOCK IN
// =======================
const stockIn = async (req, res) => {
  try {
    const { productId, quantity, note } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({
        success: false,
        msg: "Product and quantity required",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        msg: "Product not found",
      });
    }

    // update product stock
    product.stock += quantity;
    product.stockIn += quantity;

    await product.save();

    // save history
    await Stock.create({
      product: productId,
      type: "IN",
      quantity,
      note,
    });

    return res.status(200).json({
      success: true,
      msg: "Stock IN successful",
      product,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};

// =======================
// STOCK OUT
// =======================
const stockOut = async (req, res) => {
  try {
    const { productId, quantity, note } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        msg: "Product not found",
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        msg: "Insufficient stock",
      });
    }

    product.stock -= quantity;
    product.stockOut += quantity;

    await product.save();

    await Stock.create({
      product: productId,
      type: "OUT",
      quantity,
      note,
    });

    return res.status(200).json({
      success: true,
      msg: "Stock OUT successful",
      product,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};

// =======================
// GET STOCK HISTORY
// =======================
const getStockHistory = async (req, res) => {
  try {
    const history = await Stock.find()
      .populate("product", "name sku")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      history,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};



// =======================
// TOTAL PROFIT DASHBOARD
// =======================
const getProfitReport = async (req, res) => {
  try {
    const products = await Product.find();

    let totalRevenue = 0;
    let totalCost = 0;
    let totalProfit = 0;

    products.forEach((p) => {
      const revenue = p.sellingPrice * p.stockOut;
      const cost = p.costPrice * p.stockOut;

      totalRevenue += revenue;
      totalCost += cost;
    });

    totalProfit = totalRevenue - totalCost;

    return res.status(200).json({
      success: true,
      totalRevenue,
      totalCost,
      totalProfit,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};



// =======================
// LOW STOCK ALERT
// =======================
const getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.find();

    const lowStock = products.filter(
      (p) => p.stock <= p.minStock
    );

    return res.status(200).json({
      success: true,
      count: lowStock.length,
      products: lowStock,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};

const getOutOfStockProducts = async (req, res) => {
  try {
    const products = await Product.find({ stock: 0 });

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
    


  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};
const deleteStockHistory = async (req, res) => {
  try {
    const deleted = await Stock.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "History not found",
      });
    }

    res.json({
      success: true,
      message: "History deleted successfully",
    });
  } catch (err) {
     console.log(err);
  res.status(500).json({ success: false, message: err.message });
    
  }
};
module.exports = {
  stockIn,
  stockOut,
  getStockHistory,
  getProfitReport,
  getLowStockProducts,
  getOutOfStockProducts,
  deleteStockHistory,
};