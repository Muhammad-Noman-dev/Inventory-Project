// const Stock = require("../model/Stock");

// const getStockHistory = async (req, res) => {
//   try {
//     const history = await StockHistory.find()
//       .populate("product", "name sku")
//       .populate("actionBy", "name email")
//       .sort({ createdAt: -1 });

//     res.json({
//       success: true,
//       history,
//     });

//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       msg: error.message,
//     });
//   }
  
// };
// const deleteStockHistory = async (req, res) => {
//   try {
//     const { id } = req.params;

//     console.log("Delete ID:", id);

//     // Ye line add karo
//     const all = await StockHistory.find();
//     console.log("History IDs:");
//     all.forEach((item) => console.log(item._id.toString()));

//     const deleted = await StockHistory.findByIdAndDelete(id);

//     console.log("Delete Result:", deleted);

//     if (!deleted) {
//       return res.status(404).json({
//         success: false,
//         message: "History not found",
//       });
//     }

//     res.json({
//       success: true,
//       message: "Deleted",
//     });
//   } catch (err) {
//     console.log(err);
//   }
// };



// module.exports = {
//   getStockHistory,
//   deleteStockHistory,
// };


