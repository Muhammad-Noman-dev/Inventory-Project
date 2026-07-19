// const express = require("express");
// const { registerAdmin, verifyOTP ,loginAdmin, forgotPassword,verifyResetOTP,resetPassword , changePassword , updateProfile , createStaff , deleteInvoice} = require("../controller/adminController");
// const Admin = require("../model/Admin");
// const protect = require("../middleware/authMiddleware");
// const roleCheck = require("../middleware/roleMiddleware");

// const router = express.Router();

// router.post("/register", registerAdmin);
// router.post("/verify-otp", verifyOTP);
// router.post("/login", loginAdmin);
// router.get("/profile", protect, (req, res) => {
//   res.status(200).json({
//     success: true,
//     admin: req.admin,
//   });
// });
// router.post("/forgot-password", forgotPassword);
// router.post("/verify-reset-otp", verifyResetOTP);
// router.post("/reset-password", resetPassword);
// router.put("/change-password", protect, changePassword);
// router.put("/update-profile", protect, updateProfile);
// router.delete("/:id", protect, roleCheck("admin"), deleteInvoice);
// router.post("/create-staff", protect, roleCheck("admin"), createStaff);


// module.exports = router;