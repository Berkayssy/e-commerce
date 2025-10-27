const mongoose = require("mongoose");
const cron = require("node-cron");
const Seller = require("../models/Seller");
const Notification = require("../models/Notification");
const User = require("../models/User");
require("dotenv").config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {})
  .catch((err) => {
    console.error("Cron: MongoDB connection error", err);
    process.exit(1);
  });

cron.schedule("0 0 * * *", async () => {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const now = new Date();
      // Mevcut kodun burada
      const expiredSellers = await Seller.find({
        planEndDate: { $lt: now },
        isActive: true,
        status: { $in: ["active", "pending"] },
      });

      for (const seller of expiredSellers) {
        seller.isActive = false;
        seller.status = "expired";
        await seller.save();

        if (seller.storeId) {
          const store = await mongoose
            .model("Community")
            .findById(seller.storeId);
          if (store) {
            store.visible = false;
            await store.save();
          }
        }

        const user = await User.findById(seller.userId);
        if (user && seller.emailNotifications) {
          await Notification.create({
            user: seller.userId,
            store: seller.storeId,
            type: "plan_expired",
            message: `Dear ${seller.name}, your plan has expired. Your store is now hidden. Please renew your plan to continue selling.`,
            email: user.email,
          });
        }
      }

      const sevenDaysFromNow = new Date(
        now.getTime() + 7 * 24 * 60 * 60 * 1000
      );
      const sellersExpiringSoon = await Seller.find({
        planEndDate: {
          $gte: now,
          $lte: sevenDaysFromNow,
        },
        isActive: true,
        status: "active",
        planReminders: true,
      });

      for (const seller of sellersExpiringSoon) {
        const user = await User.findById(seller.userId);
        if (user && seller.emailNotifications) {
          const daysLeft = Math.ceil(
            (seller.planEndDate - now) / (1000 * 60 * 60 * 24)
          );

          await Notification.create({
            user: seller.userId,
            store: seller.storeId,
            type: "plan_reminder",
            message: `Dear ${seller.name}, your plan expires in ${daysLeft} days. Please renew to avoid service interruption.`,
            email: user.email,
          });
        }
      }
    });
  } catch (err) {
    console.error("Cron job failed:", err);
    // ✅ Sentry/Logging service entegrasyonu
  } finally {
    session.endSession();
  }
});
