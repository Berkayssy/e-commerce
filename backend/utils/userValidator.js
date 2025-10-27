const { body } = require('express-validator');
exports.createUser = [
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
];