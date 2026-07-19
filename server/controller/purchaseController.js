const Purchase = require("../model/Purchase");
const Supplier = require("../model/Supplier");
const Product = require("../model/Product");

// =======================
// CREATE PURCHASE
// =======================
const createPurchase = async (req, res) => {
  try {
    const { supplierId, products } = req.body;

    if (!supplierId || !products || products.length === 0) {
      return res.status(400).json({
        success: false,
        msg: "Supplier and products required",
      });
    }

    let totalAmount = 0;

    const supplier = await Supplier.findById(supplierId);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        msg: "Supplier not found",
      });
    }

    // process products
    for (let item of products) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({
          success: false,
          msg: "Product not found",
        });
      }

      item.total = item.costPrice * item.quantity;
      totalAmount += item.total;

      // update stock (purchase increases stock)
      product.stock += item.quantity;
      await product.save();
    }

    // create purchase
    const purchase = await Purchase.create({
      supplier: supplierId,
      products,
      totalAmount,
    });

    // update supplier stats
    supplier.totalPurchase += totalAmount;
    await supplier.save();

    return res.status(201).json({
      success: true,
      msg: "Purchase created successfully",
      purchase,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};

const getPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find()
      .populate("supplier", "name phone")
      .populate("products.product", "name sku")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      purchases,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};

module.exports = {
  createPurchase,
  getPurchases,
};