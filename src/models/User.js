const { Schema, model } = require("mongoose");
const ROLE = require("../config/roles");

// Define the User Schema
const UserSchema = new Schema(
  {
    // Personal Information
    name: {
      type: String,
      required: true,
    }, // Personal Information
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    // Other non-essential fields
    age: {
      type: Number,
      required: false,
    },
    address: {
      type: String,
      required: false,
    },

    // Account Information
    role: {
      type: String,
      default: ROLE.user,
      enum: [ROLE.user, ROLE.admin],
      required: true,
    },
    validated: {
      type: Boolean,
      default: false,
    },
    termsOfServiceAccepted: {
      type: Boolean,
      default: false,
      required: true,
    },
    privacyPolicyAccepted: {
      type: Boolean,
      default: false,
      required: true,
    },
    password: {
      type: String,
      required: true,
    }, // Preferences
    preferences: {
      hideModalForProductYoko: {
        type: Boolean,
        default: false,
      },
      hideModalForContactInfoYoko: {
        type: Boolean,
        default: false,
      },
      hideModalForDeliveriesYoko: {
        type: Boolean,
        default: false,
      },
      hideModalForOrdersYoko: {
        type: Boolean,
        default: false,
      },
      // Add more preferences here as needed
    },
  },
  { timestamps: true } // Automatically add timestamps for createdAt and updatedAt
);
// Function to generate a random password

// Create and export the User model
// Create and export the User model
const UserModel = model("User", UserSchema);
module.exports = UserModel;
