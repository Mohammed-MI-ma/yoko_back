const express = require("express");
const router = express.Router();
const preferencesController = require("../../controllers/auth/preferences");
const { ROLE } = require("../../config/roles");
const { userAuth, checkRole } = require("../../controllers/auth/");

router.put(
  "/updateVisibilityModalReadMoreDeliveryBoy",
  userAuth,
  checkRole([ROLE.admin]),
  preferencesController.updateVisibilityModalReadMoreDeliveryBoy
);
router.put(
  "/updateVisibilityModalReadMoreProducts",
  userAuth,
  checkRole([ROLE.admin]),
  preferencesController.updateVisibilityModalReadMoreProducts
);

module.exports = router;
