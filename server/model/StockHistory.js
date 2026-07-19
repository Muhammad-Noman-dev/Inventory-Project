const mongoose = require("mongoose");

const stockHistorySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },

    type: {
      type: String,
      enum: ["IN", "OUT", "ADJUST"],
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
    },

    previousStock: Number,
    newStock: Number,

    reason: {
      type: String,
      default: "",
    },

    actionBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StockHistory", stockHistorySchema);