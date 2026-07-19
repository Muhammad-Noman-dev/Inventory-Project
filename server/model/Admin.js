const mongoose = require("mongoose")


const adminSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true
    },
    password:{
        type:String,
        required:true
    },
    isVerified:{
         type: Boolean,
      default: false,
    },
    otp: {
      type: String,
      default: null,
    },

    otpExpire: {
      type: Date,
      default: null,
    },
    role: {
  type: String,
  enum: ["admin", "staff"],
  default: "admin",
},

} , {timestamps:true})

module.exports = mongoose.model("Admin" , adminSchema)