const Joi = require("joi");
const Contact = require("../../models/Contact");

// Messages
const MSG = {
  contactNotFound: "Contact information not found",
  updateSuccess: "Contact information updated successfully",
  internalError: "Internal server error",
  invalidData: "Invalid request data",
};

// Joi schema for validating contact data
const contactSchema = Joi.object({
  phone: Joi.string().required().messages({
    "string.empty": "Phone number is required",
    "any.required": "Phone number is required",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Invalid email address",
    "string.empty": "Email is required",
    "any.required": "Email is required",
  }),
  address: Joi.string().allow("").optional(),
  socialMedia: Joi.object({
    facebook: Joi.string().allow("").optional(),
    twitter: Joi.string().allow("").optional(),
    linkedin: Joi.string().allow("").optional(),
    instagram: Joi.string().allow("").optional(),
    // Add other social media platforms as needed
  }).optional(),
  operatingHours: Joi.string().allow("").optional(),
  contactForm: Joi.boolean().optional(),
  mapEmbed: Joi.string().allow("").optional(),
  additionalContacts: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().optional(),
        role: Joi.string().optional(),
        email: Joi.string().email().optional(),
        phone: Joi.string().optional(),
      })
    )
    .optional(),
  faqs: Joi.array()
    .items(
      Joi.object({
        question: Joi.string().optional(),
        answer: Joi.string().optional(),
      })
    )
    .optional(),
  privacyPolicyLink: Joi.string().allow("").optional(),
  languagesSupported: Joi.array().items(Joi.string()).optional(),
  accessibilityInfo: Joi.string().allow("").optional(),
});

// Controller function to handle GET request for retrieving contact information
const getContactInfo = async (req, res) => {
  try {
    // Retrieve contact information from MongoDB
    const contact = await Contact.findOne();
    if (!contact) {
      return res.status(404).json({ error: MSG.contactNotFound });
    }
    res.status(200).json(contact);
  } catch (error) {
    console.error("Error retrieving contact information:", error);
    res.status(500).json({ error: MSG.internalError });
  }
};

// Controller function to handle POST request for updating or creating contact information
const updateContactInfo = async (req, res) => {
  try {
    // Validate request data using Joi schema
    const { error, value } = contactSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join("; ");
      return res.status(400).json({ error: errorMessage });
    }

    // Update the contact information in MongoDB
    await Contact.findOneAndUpdate({}, value, { upsert: true });
    res.status(200).json({ message: MSG.updateSuccess });
  } catch (error) {
    console.error("Error updating contact information:", error);
    res.status(500).json({ error: MSG.internalError });
  }
};

module.exports = {
  getContactInfo,
  updateContactInfo,
};
