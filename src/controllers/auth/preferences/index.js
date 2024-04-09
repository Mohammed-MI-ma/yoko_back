const Joi = require("joi");
const User = require("../../../models/User");

const visibilityModalReadMoreSchema = Joi.object({
  hidden: Joi.boolean().default(true),
}).options({ abortEarly: false });

const MSG = {
  userNotFound: "User not found",
  updateSuccess: "User preferences updated successfully",
  internalError: "Internal server error",
  invalidData: "Invalid request data",
};

const updateVisibilityModalReadMoreDeliveryBoy = async (req, res) => {
  try {
    // Validate request body
    const { error, value } = visibilityModalReadMoreSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: MSG.invalidData });
    }

    // Ensure userId exists in request
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ error: MSG.invalidData });
    }

    // Update user preferences
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { "preferences.hideModalForDeliveriesYoko": value.hidden } },
      { new: true }
    );

    // Check if user is not found
    if (!updatedUser) {
      return res.status(404).json({ error: MSG.userNotFound });
    }

    // Send success response
    return res.status(200).json({
      message: MSG.updateSuccess,
      data: updatedUser,
      status: "success",
    });
  } catch (error) {
    console.error("Error updating delivery boy:", error);
    res.status(500).json({ error: MSG.internalError });
  }
};
const updateVisibilityModalReadMoreProducts = async (req, res) => {
  try {
    // Validate request body
    const { error, value } = visibilityModalReadMoreSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: MSG.invalidData });
    }

    // Ensure userId exists in request
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ error: MSG.invalidData });
    }

    // Update user preferences
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { "preferences.hideModalForProductYoko": value.hidden } },
      { new: true }
    );

    // Check if user is not found
    if (!updatedUser) {
      return res.status(404).json({ error: MSG.userNotFound });
    }

    // Send success response
    return res.status(200).json({
      message: MSG.updateSuccess,
      data: updatedUser,
      status: "success",
    });
  } catch (error) {
    console.error("Error updating delivery boy:", error);
    res.status(500).json({ error: MSG.internalError });
  }
};
module.exports = {
  updateVisibilityModalReadMoreDeliveryBoy,
  updateVisibilityModalReadMoreProducts,
};
