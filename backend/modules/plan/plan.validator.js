const { body, param } = require('express-validator');

exports.createPlanValidator = [
    body('name').notEmpty().withMessage('name is required'),
    body('price').not().isEmpty().withMessage('price is required').isNumeric().withMessage('price must be a number'),
    body('durationDays').not().isEmpty().withMessage('durationDays is required').isInt({ min: 1 }).withMessage('durationDays must be integer >=1'),
    body('description').optional().isString(),
    body('features').optional().isArray()
];

exports.changePlanValidator = [
    body('newPlanId').notEmpty().withMessage('newPlanId is required')
    // paymentInfo can be validated here if included
];

exports.getPlanByIdValidator = [
    param('id').notEmpty().isMongoId().withMessage('Invalid plan ID')
];