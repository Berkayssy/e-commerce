const notificationService = require('./notification.service');
const { validateCreateNotification } = require('./notification.validator');

exports.createNotification = async (req, res, next) => {
  try {
    const { error } = validateCreateNotification(req.body);
    if (error) return res.status(400).json({ success: false, message: error.message });

    const result = await notificationService.createNotification(req.body);
    res.status(result.status || 201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.getNotifications = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const result = await notificationService.getNotifications(userId);
    res.status(result.status || 200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.removeNotification = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    const result = await notificationService.removeNotification(notificationId);
    res.status(result.status || 200).json(result);
  } catch (err) {
    next(err);
  }
};