const Category = require("../model/Category");


// =======================
// Create Category
// =======================
const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        msg: "Category name is required",
      });
    }

    // Check Duplicate
    const categoryExists = await Category.findOne({
      name: name.trim(),
    });

    if (categoryExists) {
      return res.status(400).json({
        success: false,
        msg: "Category already exists",
      });
    }

    // Create Category
    const category = await Category.create({
      name: name.trim(),
      description,
    });

    return res.status(201).json({
      success: true,
      msg: "Category created successfully",
      category,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};
// =======================
// Get All Categories
// =======================
const getCategories = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = "", sort = "newest" } = req.query;

    page = Number(page);
    limit = Number(limit);

    // Search Filter
    const filter = {
      name: {
        $regex: search,
        $options: "i",
      },
    };

    // Sorting
    let sortOption = {};

    switch (sort) {
      case "oldest":
        sortOption = { createdAt: 1 };
        break;

      case "az":
        sortOption = { name: 1 };
        break;

      case "za":
        sortOption = { name: -1 };
        break;

      default:
        sortOption = { createdAt: -1 };
    }

    // Total Categories
    const totalCategories = await Category.countDocuments(filter);

    // Get Categories
    const categories = await Category.find(filter)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit);

    return res.status(200).json({
      success: true,
      totalCategories,
      currentPage: page,
      totalPages: Math.ceil(totalCategories / limit),
      categories,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};
// =======================
// Get Single Category
// =======================
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        msg: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      category,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};
// =======================
// Update Category
// =======================
const updateCategory = async (req, res) => {
  try {
    const { name, description, isActive } = req.body;

    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        msg: "Category not found",
      });
    }

    // Duplicate Name Check
    if (name && name !== category.name) {
      const exists = await Category.findOne({
        name: name.trim(),
      });

      if (exists) {
        return res.status(400).json({
          success: false,
          msg: "Category already exists",
        });
      }

      category.name = name.trim();
    }

    if (description !== undefined) {
      category.description = description;
    }

    if (typeof isActive === "boolean") {
      category.isActive = isActive;
    }

    await category.save();

    return res.status(200).json({
      success: true,
      msg: "Category updated successfully",
      category,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};
// =======================
// Delete Category
// =======================
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        msg: "Category not found",
      });
    }

    await category.deleteOne();

    return res.status(200).json({
      success: true,
      msg: "Category deleted successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};
module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,

};