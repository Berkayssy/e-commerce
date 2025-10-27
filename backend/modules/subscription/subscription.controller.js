const subscriptionService = require('../services/subscriptionService');

exports.createSubscription = async (req, res) => {
  const result = await subscriptionService.createSubscription(req.user, req.body);
  return res.status(result.status || 200).json(result);
};

exports.getSubscriptions = async (req, res) => {
  const result = await subscriptionService.getSubscriptions(req.user);
  return res.status(result.status || 200).json(result);
};