const Notification = require('../../models/Notification');

exports.createNotification = async ({ user, store, type, message, email }) => {
  if (!user || !type || !message) {
    return { success: false, status: 400, message: 'User, type and message are required' };
  }

  const notification = new Notification({ user, store, type, message, email });
  await notification.save();

  return { success: true, status: 201, notification };
};

exports.getNotifications = async (userId) => {
  if (!userId) {
    return { success: false, status: 400, message: 'User ID is required' };
  }

  const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 });
  return { success: true, status: 200, notifications };
};

exports.removeNotification = async (notificationId) => {
  if (!notificationId) {
    return { success: false, status: 400, message: 'Notification ID is required' };
  }

  const deleted = await Notification.findByIdAndDelete(notificationId);
  if (!deleted) {
    return { success: false, status: 404, message: 'Notification not found' };
  }

  return { success: true, status: 200, message: 'Notification deleted successfully' };
};