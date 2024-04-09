const Joi = require("joi");
const Product = require("../../models/Product");
const { MeiliSearch } = require("meilisearch");
let global_index;
// Initialize MeiliSearch client
const meiliSearchClient = new MeiliSearch({
  host: "http://localhost:7700", // MeiliSearch server URL
  apiKey: "wLWV0HDaNmY1bqnuQB3M_ZKjIN1HvzeObuSVl8F28w4s", // API key for authentication (optional)
});

const createIndexIfNotExists = async () => {
  try {
    global_index = await meiliSearchClient.getIndex("product");
  } catch (error) {
    try {
      global_index = await meiliSearchClient.createIndex("product");
    } catch (createError) {
      console.error(
        "Erreur lors de la création de l'index `Product` :",
        createError
      );
    }
  }
};

createIndexIfNotExists();
const MSG = {
  productNotFound: "Product not found",
  createSuccess: "Product created successfully",
  getAllSuccess: "All Products retrieved successfully",
  updateSuccess: "Product information updated successfully",
  deleteSuccess: "Product information deleted successfully",
  internalError: "Internal server error",
  invalidData: "Invalid request data",
};
const productVariantSchema = Joi.object({
  sku: Joi.string().required(),
  size: Joi.string().allow("").optional(),
  color: Joi.string().allow("").optional(),
  quantity: Joi.number().required().min(0),
  images: Joi.array().items(Joi.string()).optional(),
});

const productSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().required().min(0),
  category: Joi.string()
    .required()
    .valid(
      "Electronics",
      "Clothing",
      "Home & Kitchen",
      "Books",
      "Beauty",
      "Toys",
      "Other"
    ),
  brand: Joi.string().allow("").optional(),
  variants: Joi.array().items(productVariantSchema).required(),
  ratings: Joi.array()
    .items(
      Joi.object({
        user: Joi.objectId().required(),
        rating: Joi.number().required().min(1).max(5),
        review: Joi.string().allow("").optional(),
        createdAt: Joi.date().default(Date.now, "time of creation").optional(),
      })
    )
    .optional(),
  createdAt: Joi.date().default(Date.now, "time of creation").optional(),
  updatedAt: Joi.date().default(Date.now, "time of creation").optional(),
});

//1-Product_CREATION
const createProduct = async (req, res) => {
  try {
    const { error, value } = productSchema.validate(req.body.productData);
    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join("; ");
      return res.status(400).json({ error: errorMessage });
    }

    const newProduct = await Product.create(value);
    const products = await Product.find();

    //MeiliSearch
    await global_index.addDocuments([newProduct.toObject()]);

    return res.status(200).json({
      message: MSG.createSuccess,
      data: products,
      status: "success",
      newDeliveryBoy: newProduct,
    });
  } catch (error) {
    console.error();
    res.status(500).json({
      error: MSG.internalError,
      message: "Error creating product:",
      error,
    });
  }
};
//2-Product_READ_ALL_MONGO
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json({ message: MSG.getAllSuccess, data: products });
  } catch (error) {
    console.error("Error retrieving products:", error);
    res.status(500).json({ error: MSG.internalError });
  }
};
//3-product_READ_ONE_ID_MONGO
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!deliveryBoy) {
      return res.status(404).json({ error: MSG.productNotFound });
    }
    res.status(200).json({ data: product });
  } catch (error) {
    console.error("Error retrieving product:", error);
    res.status(500).json({ error: MSG.internalError });
  }
};
//4-product_CREATION
const updateProductById = async (req, res) => {
  try {
    const productyId = req.params.id;
    const updateData = req.body;
    const { error, value } = productSchema.validate(updateData);
    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join("; ");
      return res.status(400).json({ error: errorMessage });
    }
    const updatedProduct = await Product.findByIdAndUpdate(productyId, value, {
      new: true,
    });
    if (!updatedProduct) {
      return res.status(404).json({ error: MSG.productNotFound });
    }
    await global_index.updateDocuments([updatedProduct.toObject()]);
    const products = await Product.find();

    return res.status(200).json({
      message: MSG.updateSuccess,
      data: products,
      updatedProduct: updatedProduct,
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      error: MSG.internalError,
      message: "Error updating product:",
      error,
    });
  }
};

//5-product_DELETE
const deleteProductById = async (req, res) => {
  try {
    const productId = req.params.id;
    const deletedProduct = await Product.findByIdAndDelete(productId);
    if (!deletedProduct) {
      return res.status(404).json({ error: MSG.productNotFound });
    }
    const products = await Product.find();

    //MeiliSearch
    await global_index.deleteDocument(productId);

    return res.status(200).json({
      message: MSG.deleteSuccess,
      data: products,
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      error: MSG.internalError,
      message: "Error deleting products:",
      error,
    });
  }
};

//6-deliveryBoy_SEARCH_ENGINE
const searchProducts = async (req, res) => {
  try {
    const { query } = req.query;
    const index = meiliSearchClient.index("product");
    const searchParams = {
      attributesToHighlight: ["name", "description", "category", "brand"], // Optional: Highlight these attributes in the search results
    };
    if (query.trim() !== "") {
      searchParams.q = query;
    }
    const { hits } = await index.search("", searchParams);
    return res.status(200).json({ message: MSG.getAllSuccess, data: hits });
  } catch (error) {
    res.status(500).json({
      error: MSG.internalError,
      message: "Error searching products:",
      error,
    });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProductById,
  deleteProductById,
  searchProducts,
};
