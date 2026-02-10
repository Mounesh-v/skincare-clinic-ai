import mongoose from "mongoose";


const RegisterUsers = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  confirmPassword: {
    type: String,
    required: true,
  },
   agreeToTerms: {
    type: Boolean,
    required: true,
    default: false
  },
}, { timestamps: true });

export default mongoose.model("RegisterUsers", RegisterUsers);