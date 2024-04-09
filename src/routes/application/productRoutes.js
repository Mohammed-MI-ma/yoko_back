const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();
const productController = require("../../controllers/product");
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
router.post("/", productController.createProduct);
router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);
router.put("/:id", productController.updateProductById);
router.delete("/:id", limiter, productController.deleteProductById);
router.post("/search", productController.searchProducts);

module.exports = router;
