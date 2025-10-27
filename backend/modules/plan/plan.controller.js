const planService = require("./plan.service");
const {
  createPlanValidator,
  changePlanValidator,
} = require("./plan.validator");
const { validate } = require("../../middlewares/validationMiddleware");

exports.createPlan = async (req, res, next) => {
  try {
    // validation handled by route middleware; but double-check optional
    const result = await planService.createPlan(req.body);
    return res.status(result.status || 201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.getPlanStatus = async (req, res, next) => {
  try {
    const result = await planService.getPlanStatus(req.user);
    return res.status(result.status || 200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.getPlans = async (req, res, next) => {
  try {
    const result = await planService.getAllPlans();
    return res.status(result.status || 200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.changePlan = async (req, res, next) => {
  try {
    const result = await planService.changePlan(req.user, req.body);
    return res.status(result.status || 200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.getPlanById = async (req, res, next) => {
  try {
    const result = await planService.getPlanById(req.params.id);
    return res.status(result.status || 200).json(result);
  } catch (err) {
    next(err);
  }
};
