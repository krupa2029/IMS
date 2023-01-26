const express = require("express");
const {
  validator
} = require("../../../../commonLibrary/src/helpers/joiValidator.helper");

const router = express.Router();

const userController = require("../controllers/user.controller");
const userValidation = require("../validations/user.validation");

router.get(
    '/add-edit',
    validator.body(userValidation.addEditUser),
    userController.addEditUser
);

module.exports = router;
