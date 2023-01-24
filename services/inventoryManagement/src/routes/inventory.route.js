const express = require("express");
const {
  validator
} = require("../../../../commonLibrary/src/helpers/joiValidator.helper");

const router = express.Router();

const inventoryController = require("../controllers/inventory.controller");
const inventoryValidation = require("../validations/inventory.validation");

router.get(
    '/add-edit',
    inventoryController.addEditInventory
);

module.exports = router;
