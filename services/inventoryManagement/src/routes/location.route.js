const express = require("express");
const { authenticate } = require("../../../../commonLibrary/src/helpers/auth.helper");
const {
  validator
} = require("../../../../commonLibrary/src/helpers/joiValidator.helper");

const router = express.Router();

const locationController = require("../controllers/location.controller");
const locationValidation = require("../validations/location.validation");

router.post(
    '/add-edit',
    validator.body(locationValidation.addEditLocation),
    authenticate,
    locationController.addEditLocation
);

module.exports = router;
