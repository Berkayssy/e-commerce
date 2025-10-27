const express = require('express');
const router = express.Router();
const controller = require('./notification.controller');

router.post('/', controller.createNotification);
router.get('/:userId', controller.getNotifications);
router.delete('/:notificationId', controller.removeNotification);

module.exports = router;