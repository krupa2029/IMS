const express = require("express");
const { authenticate } = require("../../../../commonLibrary/src/helpers/auth.helper");
const {
  validator,
} = require("../../../../commonLibrary/src/helpers/joiValidator.helper");

const router = express.Router();

const inventoryController = require("../controllers/inventory.controller");
const inventoryValidation = require("../validations/inventory.validation");

router.post(
  "/add-edit",
  validator.body(inventoryValidation.addEditInventory),
  authenticate,
  inventoryController.addEditInventory
);

router.post(
  "/checkout",
  validator.body(inventoryValidation.checkoutInventory),
  authenticate,
  inventoryController.checkoutInventory
);

router.post(
  "/return",
  validator.body(inventoryValidation.returnInventory),
  authenticate,
  inventoryController.returnInventory
);

router.post(
  "/list",
  validator.body(inventoryValidation.getInventoryList),
  authenticate,
  inventoryController.getInventoryList
);

router.post(
  "/checkout-list",
  validator.body(inventoryValidation.getCheckoutList),
  authenticate,
  inventoryController.getCheckoutList
);

module.exports = router;
