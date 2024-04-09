const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();
const deliveryBoyController = require("../../controllers/deliveryBoy");

// Define rate limiting options
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

// Create a new delivery boy
router.post("/", deliveryBoyController.createDeliveryBoy);

// Get all delivery boys
router.get("/", deliveryBoyController.getAllDeliveryBoys);

// Get a specific delivery boy by ID
router.get("/:id", deliveryBoyController.getDeliveryBoyById);

// Update a specific delivery boy by ID
router.put("/:id", deliveryBoyController.updateDeliveryBoyById);

// Delete a specific delivery boy by ID
router.delete("/:id", deliveryBoyController.deleteDeliveryBoyById);

// Apply rate limiting middleware only to the GET /delivery-boys endpoint
router.get("/", limiter, deliveryBoyController.getAllDeliveryBoys);

// Apply rate limiting middleware only to the GET /delivery-boys endpoint
router.post("/search", deliveryBoyController.searchDeliveryBoys);

module.exports = router;
