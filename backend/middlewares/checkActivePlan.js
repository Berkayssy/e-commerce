const Community = require("../models/Community");
const Subscription = require("../models/Subscription");

module.exports = async function checkActivePlan(req, res, next) {
  try {
    const storeId =
      req.body.storeId ||
      req.params.storeId ||
      req.query.storeId ||
      req.body.communityId ||
      req.params.communityId ||
      req.query.communityId;

    if (!storeId) {
      return res.status(400).json({ error: "Store ID is required" });
    }

    // ✅ Single query with projection
    const store = await Community.findById(storeId).select("visible");
    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }

    if (store.visible === false) {
      return res
        .status(403)
        .json({ error: "Store is not visible (plan expired)" });
    }

    // ✅ Cache this check if frequent
    const now = new Date();
    const activeSub = await Subscription.findOne({
      store: storeId,
      isActive: true,
      endDate: { $gt: now },
    }).select("_id"); // Sadece ID yeterli

    if (!activeSub) {
      return res
        .status(403)
        .json({ error: "No active subscription for this store" });
    }

    next();
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Plan check failed", details: err.message });
  }
};
