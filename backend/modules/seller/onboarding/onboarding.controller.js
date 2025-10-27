const onboardingService = require("./onboarding.service");

exports.startOnboarding = async (req, res) => {
  try {
    const result = await onboardingService.startOnboardingService(
      req.user.id,
      req.body
    );
    return res.status(200).json(result);
  } catch (error) {
    console.error("Start onboarding controller error:", error);
    return res.status(error.status || 500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.updateStoreInfo = async (req, res) => {
  try {
    const result = await onboardingService.updateStoreInfoService(
      req.user.id,
      req.body
    );
    return res.status(200).json(result);
  } catch (error) {
    console.error("Update store info controller error:", error);
    return res.status(error.status || 500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.selectPlan = async (req, res) => {
  try {
    const result = await onboardingService.selectPlanService(
      req.user.id,
      req.body
    );
    return res.status(200).json(result);
  } catch (error) {
    console.error("Select plan controller error:", error);
    return res.status(error.status || 500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.setupPayment = async (req, res) => {
  try {
    const result = await onboardingService.setupPaymentService(
      req.user.id,
      req.body
    );
    return res.status(200).json(result);
  } catch (error) {
    console.error("Setup payment controller error:", error);
    return res.status(error.status || 500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.completeOnboarding = async (req, res) => {
  try {
    const result = await onboardingService.completeOnboardingService(
      req.user.id
    );
    return res.status(200).json(result);
  } catch (error) {
    console.error("Complete onboarding controller error:", error);
    return res.status(error.status || 500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.getOnboardingStatus = async (req, res) => {
  try {
    const result = await onboardingService.getOnboardingStatusService(
      req.user.id
    );
    return res.status(200).json(result);
  } catch (error) {
    console.error("Get onboarding status controller error:", error);
    return res.status(error.status || 500).json({
      success: false,
      error: error.message,
    });
  }
};
