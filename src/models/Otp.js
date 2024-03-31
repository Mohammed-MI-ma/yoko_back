const { Schema, model } = require("mongoose");

// Define the OTP Schema
const OTPSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      // Index for automatic deletion of expired documents
      index: { expires: "1m" }, // Documents expire after 1 minute
    },
  },
  { timestamps: true } // Automatically add timestamps for createdAt and updatedAt
);

// Create and export the OTP model
const OTPModel = model("OTP", OTPSchema);
module.exports = OTPModel;
