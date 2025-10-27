const { body, param } = require('express-validator');

exports.updateSellerProfileValidator = [
  body('name').optional().isString().withMessage('Name must be a string'),
  body('surname').optional().isString().withMessage('Surname must be a string'),
  body('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
  body('country').optional().isString(),
  body('city').optional().isString(),
  body('address').optional().isString(),
  body('emailNotifications').optional().isBoolean().withMessage('emailNotifications must be boolean'),
  body('planReminders').optional().isBoolean().withMessage('planReminders must be boolean'),
];

exports.assignAdminValidator = [
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format'),
];

exports.removeAdminValidator = [
  param('communityId')
    .notEmpty().withMessage('Community ID is required')
    .isMongoId().withMessage('Invalid community ID format'),
  body('adminId')
    .notEmpty().withMessage('Admin ID is required')
    .isMongoId().withMessage('Invalid admin ID format'),
];
