import mongoose from "mongoose";

const { Schema } = mongoose;

// Label Schema
const LabelSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true, // Ensures no extra spaces in the name
    },
    checklistCategory: {
        type: Schema.Types.ObjectId,
        ref: "CheckListCategoryModel", // Reference to CheckListCategory model
        required: true,
      }
      
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

const Label = mongoose.model("Label", LabelSchema);

export default Label;
