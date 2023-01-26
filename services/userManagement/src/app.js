const express = require('express');

const app = express();

/**
 * dotenv For Managing Environments in node js
 */
const dotenv = require('dotenv');

const envFile = '.env';
dotenv.config({ path: envFile });

/** Express middleware - cors
 * enables cross-origin-resource-sharing for express apis
 */
const cors = require('cors');

app.use(cors());

/** Express middleware - body-parser
 * body-parser extract the entire body portion of an incoming request stream and exposes it on req.body
 */
const bodyParser = require('body-parser');

app.use(bodyParser.json({ limit: '50mb' })); // support parsing of application/json type post data
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true })); // support parsing of application/x-www-form-urlencoded post data

/**
 * Routes
 */
app.use('/user/', require('./routes/user.route'));
app.use('/role/', require('./routes/role.route'));

/**
 * Response Handling Middleware
 */
app.use(require('../../../commonLibrary/src/helpers/responseHandler.helper'));

/**
 * Joi Validation Error Handling Middleware
 */
app.use(
  require('../../../commonLibrary/src/helpers/errorHandler.helper').handleJoiErrors
);

/**
 * Error Handling Middleware
 */
app.use(require('../../../commonLibrary/src/helpers/errorHandler.helper').handleErrors);


module.exports = app;


