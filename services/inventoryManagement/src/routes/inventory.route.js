const express = require("express");
const {
  validator,
} = require("../../../../commonLibrary/src/helpers/joiValidator.helper");

const router = express.Router();

const inventoryController = require("../controllers/inventory.controller");
const inventoryValidation = require("../validations/inventory.validation");

router.post(
  "/add-edit",
  validator.body(inventoryValidation.addEditInventory),
  inventoryController.addEditInventory
);

router.post(
  "/checkout",
  validator.body(inventoryValidation.checkoutInventory),
  inventoryController.checkoutInventory
);

router.post(
  "/return",
  validator.body(inventoryValidation.returnInventory),
  inventoryController.returnInventory
);

router.post(
  "/list",
  validator.body(inventoryValidation.getInventoryList),
  inventoryController.getInventoryList
);

module.exports = router;
