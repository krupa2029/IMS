const express = require("express");
const { authenticate } = require("../../../../commonLibrary/src/helpers/auth.helper");
const {
  validator,
} = require("../../../../commonLibrary/src/helpers/joiValidator.helper");

const router = express.Router();

const userController = require("../controllers/user.controller");
const userValidation = require("../validations/user.validation");

router.post(
  "/add-edit",
  validator.body(userValidation.addEditUser),
  authenticate,
  userController.addEditUser
);

router.post(
  "/login",
  validator.body(userValidation.userLogin),
  userController.userLogin
);

router.get(
  "/details",
  authenticate,
  userController.getUserDetails
);

module.exports = router;
