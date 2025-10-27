const { body } = require('express-validator');

exports.createSubscriptionValidator = [
  body('plan')
    .notEmpty()
    .withMessage('Plan ID is required')
    .isMongoId()
    .withMessage('Invalid Plan ID format'),
  body('store')
    .notEmpty()
    .withMessage('Store ID is required')
    .isMongoId()
    .withMessage('Invalid Store ID format'),
  body('durationDays')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Duration must be a positive integer'),
];