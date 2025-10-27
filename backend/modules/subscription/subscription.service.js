const Subscription = require('../models/Subscription');

exports.createSubscription = async (user, body) => {
  try {
    const { plan, store, durationDays } = body;

    if (!user || !plan || !store) {
      return {
        success: false,
        status: 400,
        message: 'Missing required fields: user, plan, and store are required.'
      };
    }

    const subscription = new Subscription({
      userId: user._id || user,
      planId: plan,
      storeId: store,
      durationDays,
      startDate: new Date(),
      endDate: durationDays ? new Date(Date.now() + durationDays * 86400000) : undefined,
    });

    await subscription.save();

    return {
      success: true,
      status: 201,
      message: 'Subscription created successfully.',
      subscription,
    };
  } catch (error) {
    console.error('Create subscription error:', error);
    return {
      success: false,
      status: 500,
      message: 'Failed to create subscription.',
      details: error.message,
    };
  }
};

exports.getSubscriptions = async (user) => {
  try {
    const subscriptions = await Subscription.find({ userId: user._id || user })
      .populate('planId', 'name price durationDays')
      .populate('storeId', 'name logo');

    return {
      success: true,
      status: 200,
      subscriptions,
    };
  } catch (error) {
    console.error('Get subscriptions error:', error);
    return {
      success: false,
      status: 500,
      message: 'Failed to fetch subscriptions.',
      details: error.message,
    };
  }
};