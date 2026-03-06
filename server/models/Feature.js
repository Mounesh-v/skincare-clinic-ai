import mongoose from "mongoose";

const featureSchema = new mongoose.Schema(
  {
    Adname: {
      type: String,
      required: true,
    },
    Adddescription: {
      type: String,
      required: true,
    },
    Addimage: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Feature", featureSchema);
