const orderService = require("./orders.service");
const {
  validateCreateOrder,
  validateUpdateStatus,
} = require("./order.validator");

exports.createOrder = async (req, res, next) => {
  try {
    const { error } = validateCreateOrder(req.body);
    if (error)
      return res.status(400).json({ success: false, message: error.message });

    const result = await orderService.createOrder(req.user, req.body);
    return res.status(result.status).json(result);
  } catch (err) {
    next(err);
  }
};

exports.getMyOrders = async (req, res, next) => {
  try {
    const result = await orderService.getMyOrders(req.user);
    return res.status(result.status).json(result);
  } catch (err) {
    next(err);
  }
};

exports.getAllOrders = async (req, res, next) => {
  try {
    const result = await orderService.getAllOrders(req.query.communityId);
    return res.status(result.status).json(result);
  } catch (err) {
    next(err);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { error } = validateUpdateStatus(req.body);
    if (error)
      return res.status(400).json({ success: false, message: error.message });

    const result = await orderService.updateOrderStatus(
      req.user,
      req.params.id,
      req.body.status
    );
    return res.status(result.status).json(result);
  } catch (err) {
    next(err);
  }
};
exports.getOrderById = async (req, res, next) => {
  try {
    const result = await orderService.getOrderById(req.params.id);
    return res.status(result.status).json(result);
  } catch (err) {
    next(err);
  }
};

exports.getSellerOrders = async (req, res, next) => {
  try {
    const result = await orderService.getSellerOrders(req.params.sellerId);
    return res.status(result.status).json(result);
  } catch (err) {
    next(err);
  }
};

exports.getOrderAnalytics = async (req, res, next) => {
  try {
    const result = await orderService.getOrderAnalytics(req.user);
    return res.status(result.status).json(result);
  } catch (err) {
    next(err);
  }
};
