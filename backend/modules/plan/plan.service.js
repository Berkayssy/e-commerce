const Plan = require("../../models/Plan");
const { handleServiceError } = require("../../utils/errorHandler");

exports.createPlan = async (planData) => {
  try {
    const plan = new Plan(planData);
    await plan.save();
    return { success: true, data: plan };
  } catch (error) {
    return handleServiceError(error, "createPlan");
  }
};

exports.getAllPlans = async () => {
  try {
    const plans = await Plan.find();
    return { success: true, data: plans };
  } catch (error) {
    return handleServiceError(error, "getAllPlans");
  }
};

exports.getPlanById = async (planId) => {
  try {
    const plan = await Plan.findById(planId);
    if (!plan) {
      return { success: false, status: 404, message: "Plan not found" };
    }
    return { success: true, data: plan };
  } catch (error) {
    return handleServiceError(error, "getPlanById");
  }
};

exports.updatePlan = async (planId, updateData) => {
  try {
    const plan = await Plan.findByIdAndUpdate(planId, updateData, {
      new: true,
    });
    if (!plan) {
      return { success: false, status: 404, message: "Plan not found" };
    }
    return { success: true, data: plan };
  } catch (error) {
    return handleServiceError(error, "updatePlan");
  }
};

exports.getPlanStatus = async (user) => {
  try {
    if (!user) {
      return { success: false, status: 401, message: "User not authenticated" };
    }
    // Mock implementation - in real app, this would check user's subscription
    return { success: true, data: { status: "active", plan: "basic" } };
  } catch (error) {
    return handleServiceError(error, "getPlanStatus");
  }
};

exports.changePlan = async (user, planData) => {
  try {
    if (!user) {
      return { success: false, status: 401, message: "User not authenticated" };
    }
    if (!planData.planId) {
      return { success: false, status: 400, message: "Plan ID is required" };
    }
    // Mock implementation - in real app, this would update user's subscription
    return { success: true, message: "Plan changed successfully" };
  } catch (error) {
    return handleServiceError(error, "changePlan");
  }
};
