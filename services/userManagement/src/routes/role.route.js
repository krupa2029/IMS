const express = require("express");
const { authenticate } = require("../../../../commonLibrary/src/helpers/auth.helper");
const {
  validator
} = require("../../../../commonLibrary/src/helpers/joiValidator.helper");

const router = express.Router();

const roleController = require("../controllers/role.controller");
const roleValidation = require("../validations/role.validation");

router.post(
    '/add-edit',
    validator.body(roleValidation.addEditRole),
    authenticate,
    roleController.addEditRole
);

router.post(
    '/permission/add-edit',
    validator.body(roleValidation.addEditPermission),
    authenticate,
    roleController.addEditPermission
);

module.exports = router;
