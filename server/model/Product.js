const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    sku: {
      type: String,
      unique: true,
      required: true,
    },

    costPrice: {
      type: Number,
      required: true,
    },

    sellingPrice: {
      type: Number,
      required: true,
    },

    stock: {
      type: Number,
      default: 0,
    },

    image: {
      type: String,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    stockIn: {
  type: Number,
  default: 0,
},

stockOut: {
  type: Number,
  default: 0,
},
totalProfit: {
  type: Number,
  default: 0,
},
minStock: {
  type: Number,
  default: 5,
},
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);