const { Schema, model } = require("mongoose");

// Define the User Schema
const ContactSchema = new Schema(
  {
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    address: {
      type: String,
    },
    socialMedia: {
      facebook: String,
      twitter: String,
      linkedin: String,
      instagram: String,
      // Add other social media platforms as needed
    },
    operatingHours: {
      type: String,
    },
    contactForm: {
      type: Boolean,
      default: true,
    },
    mapEmbed: {
      type: String,
    },
    additionalContacts: [
      {
        name: String,
        role: String,
        email: String,
        phone: String,
      },
    ],
    faqs: [
      {
        question: String,
        answer: String,
      },
    ],
    privacyPolicyLink: {
      type: String,
    },
    languagesSupported: {
      type: [String],
    },
    accessibilityInfo: {
      type: String,
    },
  },
  { timestamps: true } // Automatically add timestamps for createdAt and updatedAt
);

// Create and export the User model
const ContactModel = model("Contact", ContactSchema);
module.exports = ContactModel;
