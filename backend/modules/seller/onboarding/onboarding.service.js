const mongoose = require("mongoose");
const Seller = require("../../../models/Seller");
const Community = require("../../../models/Community");
const Plan = require("../../../models/Plan");
const { createError } = require("../../../utils/errorHandler");

exports.startOnboardingService = async (userId, userData) => {
  try {
    // Check if user already has ongoing onboarding
    const existingSeller = await Seller.findOne({ userId });
    if (existingSeller) {
      throw createError("Onboarding already completed or in progress", 400);
    }

    // Step 1: Create temporary seller record
    const seller = new Seller({
      userId,
      name: userData.name || "",
      surname: userData.surname || "",
      phone: userData.phone || "",
      country: userData.country || "",
      city: userData.city || "",
      address: userData.address || "",
      status: "onboarding",
    });

    await seller.save();

    return {
      success: true,
      message: "Onboarding started successfully",
      onboardingStep: 1, // Store basic info
      sellerId: seller._id,
    };
  } catch (error) {
    console.error("Start onboarding error:", error);
    throw error;
  }
};

exports.updateStoreInfoService = async (userId, storeData) => {
  try {
    const seller = await Seller.findOne({ userId, status: "onboarding" });
    if (!seller) {
      throw createError("Onboarding not started or completed", 400);
    }

    // Generate unique store URL
    const baseSlug = storeData.storeName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    let storeSlug = baseSlug;
    let counter = 1;

    // Ensure unique slug
    while (await Community.findOne({ transId: storeSlug })) {
      storeSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create community/store
    const community = new Community({
      name: storeData.storeName,
      transId: storeSlug,
      owner: userId,
      rootAdmin: userId,
      admins: [userId],
      role: "seller",
    });

    await community.save();

    // Update seller with store reference
    seller.storeId = community._id;
    seller.onboardingStep = 2; // Move to plan selection
    await seller.save();

    return {
      success: true,
      message: "Store information saved successfully",
      onboardingStep: 2,
      store: {
        id: community._id,
        name: community.name,
        url: storeSlug,
      },
    };
  } catch (error) {
    console.error("Update store info error:", error);
    throw error;
  }
};

exports.selectPlanService = async (userId, planData) => {
  try {
    const seller = await Seller.findOne({
      userId,
      status: "onboarding",
    }).populate("storeId");

    if (!seller) {
      throw createError("Onboarding not started or completed", 400);
    }

    // Get plan details
    const plan = await Plan.findOne({ name: planData.planType });
    if (!plan) {
      throw createError("Selected plan not found", 404);
    }

    // Calculate plan dates
    const planStartDate = new Date();
    const planEndDate = new Date();
    planEndDate.setDate(planEndDate.getDate() + plan.durationDays);

    // Update seller with plan
    seller.planId = plan._id;
    seller.planStartDate = planStartDate;
    seller.planEndDate = planEndDate;
    seller.onboardingStep = 3; // Move to payment
    await seller.save();

    // Update community with plan
    await Community.findByIdAndUpdate(seller.storeId, {
      plan: plan._id,
    });

    return {
      success: true,
      message: "Plan selected successfully",
      onboardingStep: 3,
      plan: {
        id: plan._id,
        name: plan.name,
        price: plan.price,
        duration: plan.durationDays,
        features: plan.features,
      },
    };
  } catch (error) {
    console.error("Select plan error:", error);
    throw error;
  }
};

exports.setupPaymentService = async (userId, paymentData) => {
  try {
    const seller = await Seller.findOne({ userId, status: "onboarding" });
    if (!seller) {
      throw createError("Onboarding not started or completed", 400);
    }

    // In production, use proper payment encryption
    seller.cardInfo = {
      cardNumber: paymentData.cardNumber, // Should be encrypted
      cardExpiry: paymentData.cardExpiry,
      cardCvv: paymentData.cardCvv,
      billingAddress: paymentData.billingAddress,
    };

    seller.onboardingStep = 4; // Move to completion
    await seller.save();

    return {
      success: true,
      message: "Payment information saved successfully",
      onboardingStep: 4,
    };
  } catch (error) {
    console.error("Setup payment error:", error);
    throw error;
  }
};

exports.completeOnboardingService = async (userId) => {
  try {
    const seller = await Seller.findOne({ userId, status: "onboarding" });
    if (!seller) {
      throw createError("Onboarding not started or completed", 400);
    }

    // Finalize seller status
    seller.status = "active";
    seller.isVerified = true;
    seller.verificationDate = new Date();
    seller.onboardingStep = null; // Clear onboarding step
    await seller.save();

    // Update user role to seller
    // Note: You might want to update the User model role field

    return {
      success: true,
      message: "Onboarding completed successfully! Your store is now live.",
      seller: {
        id: seller._id,
        storeId: seller.storeId,
        status: seller.status,
      },
    };
  } catch (error) {
    console.error("Complete onboarding error:", error);
    throw error;
  }
};

exports.getOnboardingStatusService = async (userId) => {
  try {
    const seller = await Seller.findOne({ userId })
      .populate("storeId", "name transId")
      .populate("planId", "name price features");

    if (!seller) {
      return {
        success: true,
        onboardingStarted: false,
      };
    }

    return {
      success: true,
      onboardingStarted: true,
      currentStep: seller.onboardingStep || 1,
      status: seller.status,
      store: seller.storeId,
      plan: seller.planId,
    };
  } catch (error) {
    console.error("Get onboarding status error:", error);
    throw error;
  }
};
