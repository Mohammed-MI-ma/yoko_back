const Joi = require("joi");
const DeliveryBoy = require("../../models/DeliveryBoy");
const { MeiliSearch } = require("meilisearch");
let global_index;
// Initialize MeiliSearch client
const meiliSearchClient = new MeiliSearch({
  host: "http://localhost:7700", // MeiliSearch server URL
  apiKey: "wLWV0HDaNmY1bqnuQB3M_ZKjIN1HvzeObuSVl8F28w4s", // API key for authentication (optional)
});

const createIndexIfNotExists = async () => {
  try {
    global_index = await meiliSearchClient.getIndex("deliveryBoys");
  } catch (error) {
    try {
      global_index = await meiliSearchClient.createIndex("deliveryBoys");
    } catch (createError) {
      console.error(
        "Erreur lors de la création de l'index `deliveryBoys` :",
        createError
      );
    }
  }
};

// Appeler la fonction pour créer l'index si nécessaire
createIndexIfNotExists();
// Messages
const MSG = {
  deliveryBoyNotFound: "Delivery boy not found",
  createSuccess: "Delivery boy created successfully",
  getAllSuccess: "All delivery boys retrieved successfully",
  updateSuccess: "Delivery boy information updated successfully",
  deleteSuccess: "Delivery boy information deleted successfully",
  internalError: "Internal server error",
  invalidData: "Invalid request data",
};

// Joi schema for validating delivery boy data
const deliveryBoySchema = Joi.object({
  cnie: Joi.string().required().messages({
    "string.empty": "CNIE is required",
    "any.required": "CNIE is required",
  }),
  firstName: Joi.string().required().messages({
    "string.empty": "First name is required",
    "any.required": "First name is required",
  }),
  lastName: Joi.string().required().messages({
    "string.empty": "Last name is required",
    "any.required": "Last name is required",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Invalid email address",
    "string.empty": "Email is required",
    "any.required": "Email is required",
  }),
  phone: Joi.string().required().messages({
    "string.empty": "Phone number is required",
    "any.required": "Phone number is required",
  }),
  available: Joi.boolean().default(true),
  vehicleType: Joi.string().valid("Vélo", "Moto", "car", "Pickup").required(),
  sex: Joi.string().valid("homme", "femme").required(),
}).options({ abortEarly: false });

//1-deliveryBoy_CREATION
const createDeliveryBoy = async (req, res) => {
  try {
    const { error, value } = deliveryBoySchema.validate(
      req.body.deliveryBoyData
    );
    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join("; ");
      return res.status(400).json({ error: errorMessage });
    }

    const newDeliveryBoy = await DeliveryBoy.create(value);
    const deliveryBoys = await DeliveryBoy.find();

    //MeiliSearch
    await global_index.addDocuments([newDeliveryBoy.toObject()]);

    return res.status(200).json({
      message: MSG.createSuccess,
      data: deliveryBoys,
      status: "success",
      newDeliveryBoy: newDeliveryBoy,
    });
  } catch (error) {
    console.error();
    res.status(500).json({
      error: MSG.internalError,
      message: "Error creating delivery boy:",
      error,
    });
  }
};
//2-deliveryBoy_READ_ALL_MONGO
const getAllDeliveryBoys = async (req, res) => {
  try {
    const deliveryBoys = await DeliveryBoy.find();
    res.status(200).json({ message: MSG.getAllSuccess, data: deliveryBoys });
  } catch (error) {
    console.error("Error retrieving delivery boys:", error);
    res.status(500).json({ error: MSG.internalError });
  }
};
//3-deliveryBoy_READ_ONE_ID_MONGO
const getDeliveryBoyById = async (req, res) => {
  try {
    const deliveryBoy = await DeliveryBoy.findById(req.params.id);
    if (!deliveryBoy) {
      return res.status(404).json({ error: MSG.deliveryBoyNotFound });
    }
    res.status(200).json({ data: deliveryBoy });
  } catch (error) {
    console.error("Error retrieving delivery boy:", error);
    res.status(500).json({ error: MSG.internalError });
  }
};
//4-deliveryBoy_CREATION
const updateDeliveryBoyById = async (req, res) => {
  try {
    const deliveryBoyId = req.params.id;
    const updateData = req.body;
    const { error, value } = deliveryBoySchema.validate(updateData);
    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join("; ");
      return res.status(400).json({ error: errorMessage });
    }
    const updatedDeliveryBoy = await DeliveryBoy.findByIdAndUpdate(
      deliveryBoyId,
      value,
      { new: true }
    );
    if (!updatedDeliveryBoy) {
      return res.status(404).json({ error: MSG.deliveryBoyNotFound });
    }
    await global_index.updateDocuments([updatedDeliveryBoy.toObject()]);
    const deliveryBoys = await DeliveryBoy.find();

    return res.status(200).json({
      message: MSG.updateSuccess,
      data: deliveryBoys,
      updatedDeliveryBoy: updatedDeliveryBoy,
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      error: MSG.internalError,
      message: "Error updating delivery boy:",
      error,
    });
  }
};
//5-deliveryBoy_DELETE
const deleteDeliveryBoyById = async (req, res) => {
  try {
    const deliveryBoyId = req.params.id;
    const deletedDeliveryBoy = await DeliveryBoy.findByIdAndDelete(
      deliveryBoyId
    );
    if (!deletedDeliveryBoy) {
      return res.status(404).json({ error: MSG.deliveryBoyNotFound });
    }
    const deliveryBoys = await DeliveryBoy.find();

    //MeiliSearch
    await global_index.deleteDocument(deliveryBoyId);

    return res.status(200).json({
      message: MSG.deleteSuccess,
      data: deliveryBoys,
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      error: MSG.internalError,
      message: "Error deleting delivery boy:",
      error,
    });
  }
};

//6-deliveryBoy_SEARCH_ENGINE
const searchDeliveryBoys = async (req, res) => {
  try {
    const { query } = req.query;
    const index = meiliSearchClient.index("deliveryBoys");
    const searchParams = {
      attributesToHighlight: ["name", "lastName", "cnie", "phone"], // Optional: Highlight these attributes in the search results
    };
    if (query.trim() !== "") {
      searchParams.q = query;
    }
    const { hits } = await index.search("", searchParams);
    return res.status(200).json({ message: MSG.getAllSuccess, data: hits });
  } catch (error) {
    res.status(500).json({
      error: MSG.internalError,
      message: "Error searching delivery boys:",
      error,
    });
  }
};

module.exports = {
  createDeliveryBoy,
  getAllDeliveryBoys,
  getDeliveryBoyById,
  updateDeliveryBoyById,
  deleteDeliveryBoyById,
  searchDeliveryBoys,
};
