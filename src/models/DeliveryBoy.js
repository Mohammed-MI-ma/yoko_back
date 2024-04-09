const { Schema, model } = require("mongoose");

// Define the User Schema
const DeliveryBoySchema = new Schema(
  {
    // Personal Information
    cnie: {
      type: String,
      required: true,
      unique: true,
    },
    // Personal Information
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },

    available: {
      type: Boolean,
      default: true,
    },
    vehicleType: {
      type: String,
      enum: ["Vélo", "Moto", "car", "Pickup"],
      required: true,
    },
    sex: {
      type: String,
      enum: ["homme", "femme"],
      required: false,
    },
  },
  { timestamps: true } // Automatically add timestamps for createdAt and updatedAt
);
// Function to generate a random password
//DeliveryBoySchema.index({ location: "2dsphere" });

// Create and export the User model
// Create and export the User model
const DeliveryBoyModel = model("DeliveryBoy", DeliveryBoySchema);
module.exports = DeliveryBoyModel;
