const { body } = require('express-validator');

exports.createCommunityValidator = [
    body('name').notEmpty().withMessage('Name is required'),
    body('rootAdminId').notEmpty().withMessage('rootAdminId is required'),
];

exports.addAdminValidator = [
    body('communityId').notEmpty().withMessage('communityId is required'),
    body('adminId').notEmpty().withMessage('adminId is required'),
];