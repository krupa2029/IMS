/* eslint-disable consistent-return */
const jwt = require('jsonwebtoken');
const messages = require('../constants/messages');
const { UnAuthorized } = require('../utils/generalError')

module.exports = {
 
  authenticate: (req, res, next) => {
    const secretKey = Buffer.from(process.env.JWT_SECRET_KEY, 'base64');

    let token = req.headers['x-access-token'] || req.headers.authorization;
    if (token) {
      if (token.startsWith('Bearer ')) {
        token = token.slice(7, token.length); // Remove Bearer from string
      }
      jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
          console.log('err', err);
          return next(new UnAuthorized(messages.INVALID_TOKEN));
        }
        req.token = decoded;
        return next();
      });
    } else {
      return next(new UnAuthorized(messages.TOKEN_MISSING));
    }
  },

  generateToken: (data, expiresIn = '1d') => {
    const secretKey = Buffer.from(process.env.JWT_SECRET_KEY, 'base64');
    const token = jwt.sign(data, secretKey, {
      expiresIn
    });
    return token;
  },


};
