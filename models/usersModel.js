import mongoose from "mongoose";

const { Schema, model } = mongoose;

const userRoles = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ACCOUNT_ADMIN: "ACCOUNT_ADMIN",
  AUDIT_ADMIN: "AUDIT_ADMIN",
};

// Defining user schema
const userSchema = new Schema(
  {
    userName:{
      type:String,
      required:true,
    },
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: [
        userRoles.SUPER_ADMIN,
        userRoles.ACCOUNT_ADMIN,
        userRoles.AUDIT_ADMIN,
      ],
      required: true,
    },
    resetPasswordOTP: {
      type: String,
      default: null,
    },
  },
  {
    collection: "crm_users", // Specify the collection name
  }
);

// Creating User model with specified collection name
const CRMUser = model("CRMUser", userSchema); // Changed model name to CRMUser for clarity

export { CRMUser as User, userRoles }; // Exporting with the name User for consistency
