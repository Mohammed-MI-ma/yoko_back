// models/Product.js
const { Schema, model } = require("mongoose");
const { CATEGORIES } = require("../config/roles");
const categoryEnum = Object.keys(CATEGORIES).map((key) =>
  key.toLowerCase().replace(/_(\w)/g, (m, p1) => p1.toUpperCase())
);

const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      enum: categoryEnum,
      required: true,
    },
    brand: String,
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    images: [String],
    ratings: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
      },
    ],
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        text: String,
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true } // Automatically add timestamps for createdAt and updatedAt
);

// Create and export the User model
const ProductModel = model("Product", ProductSchema);
module.exports = ProductModel;
