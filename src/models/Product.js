// models/Product.js
const { Schema, model } = require("mongoose");
const { CATEGORIES } = require("../config/roles");
const categoryEnum = Object.keys(CATEGORIES).map((key) =>
  key.toLowerCase().replace(/_(\w)/g, (m, p1) => p1.toUpperCase())
);

const ProductSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: String,
    required: true,
    enum: [
      "Electronics",
      "Clothing",
      "Home & Kitchen",
      "Books",
      "Beauty",
      "Toys",
      "Other",
    ],
  },
  brand: String,
  variants: [
    {
      sku: {
        type: String,
        required: true,
        unique: true,
      },
      size: String,
      color: String,
      // Add other variant attributes as needed
      quantity: {
        type: Number,
        required: true,
        min: 0,
      },
      images: [String], // Array of image URLs for this variant
    },
  ],
  ratings: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
      review: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create and export the User model
const ProductModel = model("Product", ProductSchema);
module.exports = ProductModel;
