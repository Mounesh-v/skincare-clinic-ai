import mongoose from "mongoose";


const RegisterUsers = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: function () { return this.provider === 'local'; }
  },
  provider: {
    type: String,
    required: true,
    enum: ['local', 'google', 'facebook'],
    default: 'local'
  },
  providerId: {
    type: String,
  },
  picture: {
    type: String,
  },
  agreeToTerms: {
    type: Boolean,
    required: true,
    default: false
  },
}, { timestamps: true });

// Sparse index on providerId only: excludes local users who have no providerId
// (compound sparse index would include local users since 'provider' is always set)
RegisterUsers.index({ providerId: 1 }, { unique: true, sparse: true });

export default mongoose.model("RegisterUsers", RegisterUsers);