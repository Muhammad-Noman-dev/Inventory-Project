const Admin = require("../model/Admin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const sendEmail = require("../utils/sendEmail");
const otpGenerator = require("otp-generator");
const Invoice = require("../model/Invoice");

// =======================
// Register Admin
// =======================
const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        msg: "All fields are required",
      });
    }

    // Only one admin allowed
    const existingAdmin = await Admin.findOne();

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        msg: "Admin already exists",
      });
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
   const generateOTP = require("../utils/generateOTP");

const otp = generateOTP();

    // OTP Expiry (5 Minutes)
    const otpExpire = new Date(Date.now() + 5 * 60 * 1000);

    // Save Admin
    const admin = await Admin.create({
      name,
      email,
      password: hashedPassword,
      otp,
      otpExpire,
      isVerified: false,
    });

    // Send Email
    await sendEmail(
      email,
      "Inventory System OTP Verification",
      `
      <h2>Inventory Management System</h2>
      <p>Your OTP is:</p>
      <h1>${otp}</h1>
      <p>This OTP will expire in 5 minutes.</p>
      `
    );

    return res.status(201).json({
      success: true,
      msg: "OTP sent successfully. Please verify your account.",
      admin,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};

// =======================
// Verify OTP
// =======================
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        msg: "Email and OTP are required",
      });
    }

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(404).json({
        success: false,
        msg: "Admin not found",
      });
    }

    if (admin.otp !== otp) {
      return res.status(400).json({
        success: false,
        msg: "Invalid OTP",
      });
    }

    if (admin.otpExpire < Date.now()) {
      return res.status(400).json({
        success: false,
        msg: "OTP has expired",
      });
    }

    admin.isVerified = true;
    admin.otp = null;
    admin.otpExpire = null;

    await admin.save();

    return res.status(200).json({
      success: true,
      msg: "OTP verified successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};

// =======================
// Login Admin
// =======================
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check Required Fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        msg: "Email and Password are required",
      });
    }

    // Find Admin
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(404).json({
        success: false,
        msg: "Invalid Email",
      });
    }

    // Check OTP Verification
    if (!admin.isVerified) {
      return res.status(401).json({
        success: false,
        msg: "Please verify your account first",
      });
    }

    // Compare Password
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        msg: "Invalid Password",
      });
    }

    // Generate JWT Token
    const token = jwt.sign(
      {
        id: admin._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

  return res.status(200).json({
  success: true,
  msg: "Login Successfully",
  token,
  admin: {
    id: admin._id,
    name: admin.name,
    email: admin.email,
    role: admin.role, // ✅ ADD THIS
  },
});


  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};
// const forgotPassword = async (req, res) => {
//   try {
//     const { email } = req.body;

//     // Check Email
//     if (!email) {
//       return res.status(400).json({
//         success: false,
//         msg: "Email is required",
//       });
//     }

//     // Find Admin
//     const admin = await Admin.findOne({ email });

//     if (!admin) {
//       return res.status(404).json({
//         success: false,
//         msg: "Admin not found",
//       });
//     }

//     // Generate OTP
//     const otp = otpGenerator.generate(6, {
//       upperCaseAlphabets: false,
//       lowerCaseAlphabets: false,
//       specialChars: false,
//     });

//     // Save OTP
//     admin.otp = otp;
//     admin.otpExpire = Date.now() + 10 * 60 * 1000;

//     await admin.save();

//     // Mail Transporter
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//     });

//     // Send Email
//     await transporter.sendMail({
//       from: process.env.EMAIL,
//       to: admin.email,
//       subject: "Password Reset OTP",
//       html: `
//         <h2>Password Reset</h2>
//         <p>Your OTP is:</p>
//         <h1>${otp}</h1>
//         <p>This OTP will expire in 10 minutes.</p>
//       `,
//     });

//     res.status(200).json({
//       success: true,
//       msg: "Password Reset OTP Sent Successfully",
//     });
//   } catch (error) {
//     console.log(error);

//     res.status(500).json({
//       success: false,
//       msg: error.message,
//     });
//   }
// };
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ msg: "Email is required" });
    }

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(404).json({ msg: "Admin not found" });
    }

    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    admin.otp = otp;
    admin.otpExpire = Date.now() + 10 * 60 * 1000;

    await admin.save();

    await sendEmail(
      admin.email,
      "Password Reset OTP",
      `
        <h2>Password Reset</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>Valid for 10 minutes</p>
      `
    );

    return res.json({
      success: true,
      msg: "OTP sent successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};
const verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Check Required Fields
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        msg: "Email and OTP are required",
      });
    }

    // Find Admin
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(404).json({
        success: false,
        msg: "Admin not found",
      });
    }

    // Check OTP
    if (admin.otp !== otp) {
      return res.status(400).json({
        success: false,
        msg: "Invalid OTP",
      });
    }

    // Check OTP Expiry
    if (admin.otpExpire < Date.now()) {
      return res.status(400).json({
        success: false,
        msg: "OTP has expired",
      });
    }

    return res.status(200).json({
      success: true,
      msg: "OTP Verified Successfully",
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};
const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // Validation
    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        msg: "Email and New Password are required",
      });
    }

    // Find Admin
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(404).json({
        success: false,
        msg: "Admin not found",
      });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update Password
    admin.password = hashedPassword;

    // Clear OTP
    admin.otp = null;
    admin.otpExpire = null;

    await admin.save();

    res.status(200).json({
      success: true,
      msg: "Password Reset Successfully",
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        msg: "Current and New Password are required",
      });
    }

    // Admin comes from protect middleware
    const admin = await Admin.findById(req.admin._id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        msg: "Admin not found",
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, admin.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        msg: "Current password is incorrect",
      });
    }

    // Prevent same password
    const samePassword = await bcrypt.compare(newPassword, admin.password);

    if (samePassword) {
      return res.status(400).json({
        success: false,
        msg: "New password must be different from current password",
      });
    }

    // Hash new password
    admin.password = await bcrypt.hash(newPassword, 10);

    await admin.save();

    return res.status(200).json({
      success: true,
      msg: "Password changed successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};
const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    const admin = await Admin.findById(req.admin._id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        msg: "Admin not found",
      });
    }

    // Check if another admin is using the email
    if (email && email !== admin.email) {
      const existingAdmin = await Admin.findOne({ email });

      if (existingAdmin) {
        return res.status(400).json({
          success: false,
          msg: "Email already exists",
        });
      }
    }

    admin.name = name || admin.name;
    admin.email = email || admin.email;

    await admin.save();

    return res.status(200).json({
      success: true,
      msg: "Profile updated successfully",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
      },
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};

const createStaff = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const staff = await Admin.create({
      name,
      email,
      password: hashedPassword,
      role: "staff",
      isVerified: true,
    });

    res.status(201).json({
      success: true,
      msg: "Staff created",
      staff,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};

// =======================
// DELETE INVOICE
// =======================
const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        msg: "Invoice not found",
      });
    }

    await Invoice.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      msg: "Invoice deleted successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};
module.exports = {
  registerAdmin,
  verifyOTP,
  loginAdmin,
  forgotPassword,
  verifyResetOTP ,
  resetPassword,
  changePassword,
  updateProfile,
createStaff,
deleteInvoice,

  };