const { Schema, model } = require("mongoose");

// Define the User Schema
const ImageSchema = new Schema(
  {
    url: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    name: { type: String, required: true },
    keyword: {
      type: String,
    },
    keywords: {
      type: [String],
    },
    // Reference to the user who uploaded the image
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    size: { type: Number, required: true },
  },
  { timestamps: true } // Automatically add timestamps for createdAt and updatedAt
);

// Create and export the User model
const ImageModel = model("Image", ImageSchema);
module.exports = ImageModel;
