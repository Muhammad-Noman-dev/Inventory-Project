const Product = require("../model/Product");
const Category = require("../model/Category");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");


const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      sku,
      costPrice,
      sellingPrice,
      stock,
    } = req.body;

    // Validation
    if (!name || !category || !sku || !costPrice || !sellingPrice) {
      return res.status(400).json({
        success: false,
        msg: "Required fields are missing",
      });
    }

    // Check category exists
    const categoryExists = await Category.findById(category);

    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        msg: "Category not found",
      });
    }

    // Check duplicate SKU
    const exists = await Product.findOne({ sku });

    if (exists) {
      return res.status(400).json({
        success: false,
        msg: "SKU already exists",
      });
    }

    // Create Product
    const product = await Product.create({
      name,
      description,
      category,
      sku,
      costPrice,
      sellingPrice,
      stock,
    });

    return res.status(201).json({
      success: true,
      msg: "Product created successfully",
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
// Get All Products
// =======================
const getProducts = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 50,
      search = "",
      category,
      sort = "newest",
      stock
    } = req.query;

    page = Number(page);
    limit = Number(limit);

    // 🔍 Search filter (name + SKU)
    const filter = {
      $or: [
        { name: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
      ],
    };

    // 📂 Category filter
    if (category) {
      filter.category = category;
    }

    // 📉 Stock filter
    if (stock === "low") {
      filter.stock = { $lte: 5 };
    }

    // ⬆️ Sorting
    let sortOption = {};

    switch (sort) {
      case "price_low":
        sortOption = { sellingPrice: 1 };
        break;

      case "price_high":
        sortOption = { sellingPrice: -1 };
        break;

      case "oldest":
        sortOption = { createdAt: 1 };
        break;

      default:
        sortOption = { createdAt: -1 };
    }

    // Total count
    const total = await Product.countDocuments(filter);

    // Get products
    const products = await Product.find(filter)
      .populate("category", "name")
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit);

    return res.status(200).json({
      success: true,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      products,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};
// =======================
// Get Single Product
// =======================
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category", "name description");

    if (!product) {
      return res.status(404).json({
        success: false,
        msg: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
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
// Update Product
// =======================
const updateProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      sku,
      costPrice,
      sellingPrice,
      stock,
      isActive,
    } = req.body;

    const product = await Product.findById(req.params.id);

    // ✅ Pehle null-check (sabse zaroori)
    if (!product) {
      return res.status(404).json({
        success: false,
        msg: "Product not found",
      });
    }

    // ✅ Ab safely emit kar sakte hain kyunki product exist karta hai
    if (product.stock <= product.minStock) {
      req.app.get("io").emit("lowStockAlert", {
        product: product.name,
        stock: product.stock,
      });
    }

    req.app.get("io").emit("low-stock", {
      message: "Low Stock Alert",
      product: product.name,
      stock: product.stock,
    });

    // Check SKU duplicate
    if (sku && sku !== product.sku) {
      const exists = await Product.findOne({ sku });

      if (exists) {
        return res.status(400).json({
          success: false,
          msg: "SKU already exists",
        });
      }

      product.sku = sku;
    }

    // Update fields (only if provided)
    if (name) product.name = name;
    if (description !== undefined) product.description = description;
    if (costPrice) product.costPrice = costPrice;
    if (sellingPrice) product.sellingPrice = sellingPrice;
    if (stock !== undefined) product.stock = stock;
    if (typeof isActive === "boolean") product.isActive = isActive;

    // Category check
    if (category) {
      const Category = require("../model/Category");

      const categoryExists = await Category.findById(category);

      if (!categoryExists) {
        return res.status(404).json({
          success: false,
          msg: "Category not found",
        });
      }

      product.category = category;
    }

    await product.save();

    return res.status(200).json({
      success: true,
      msg: "Product updated successfully",
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
// Delete Product (Soft Delete)
// =======================
// const deleteProduct = async (req, res) => {
//   try {
//     const product = await Product.findById(req.params.id);

//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         msg: "Product not found",
//       });
//     }

//     // Soft Delete
//     product.isActive = false;

//     await product.save();

//     return res.status(200).json({
//       success: true,
//       msg: "Product deleted successfully (soft delete)",
//     });

//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       msg: error.message,
//     });
//   }
// };


const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        msg: "Product not found",
      });
    }

    await product.deleteOne();

    return res.status(200).json({
      success: true,
      msg: "Product deleted successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};


// =======================
// Upload Product Image
// =======================
const uploadProductImage = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        msg: "Product not found",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        msg: "No image uploaded",
      });
    }

    // Upload to Cloudinary
    const streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "inventory/products" },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    const result = await streamUpload(req);

    // Save image URL
    product.image = result.secure_url;

    await product.save();

    return res.status(200).json({
      success: true,
      msg: "Image uploaded successfully",
      image: result.secure_url,
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
// Category Inventory Summary
// =======================
const getCategorySummary = async (req, res) => {
  try {
    const summary = await Product.aggregate([
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: "$category",
      },
      {
        $group: {
          _id: "$category._id",
          categoryName: { $first: "$category.name" },

          totalProducts: { $sum: 1 },

          totalStock: { $sum: "$stock" },

          costValue: {
            $sum: {
              $multiply: ["$stock", "$costPrice"],
            },
          },

          saleValue: {
            $sum: {
              $multiply: ["$stock", "$sellingPrice"],
            },
          },

          expectedProfit: {
            $sum: {
              $multiply: [
                "$stock",
                {
                  $subtract: ["$sellingPrice", "$costPrice"],
                },
              ],
            },
          },

          lowStock: {
            $sum: {
              $cond: [
                { $lte: ["$stock", "$minStock"] },
                1,
                0,
              ],
            },
          },

          outOfStock: {
            $sum: {
              $cond: [
                { $eq: ["$stock", 0] },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $sort: {
          categoryName: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      categories: summary,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};

// =======================
// Products By Category
// =======================
const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const products = await Product.find({ category: categoryId })
      .populate("category", "name")
      .sort({ name: 1 });

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        msg: "No products found in this category",
      });
    }

    const summary = {
      totalProducts: products.length,
      totalStock: 0,
      costValue: 0,
      saleValue: 0,
      expectedProfit: 0,
      lowStock: 0,
      outOfStock: 0,
    };

    products.forEach((product) => {
      summary.totalStock += product.stock;

      summary.costValue += product.stock * product.costPrice;

      summary.saleValue += product.stock * product.sellingPrice;

      summary.expectedProfit +=
        product.stock * (product.sellingPrice - product.costPrice);

      if (product.stock === 0) {
        summary.outOfStock++;
      }

      if (product.stock > 0 && product.stock <= product.minStock) {
        summary.lowStock++;
      }
    });

    res.status(200).json({
      success: true,

      category: products[0].category,

      summary,

      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};
module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  getCategorySummary,
  getProductsByCategory,


};