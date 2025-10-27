const mongoose = require("mongoose");
const Plan = require("../models/Plan");

const plans = [
  {
    name: "basic",
    description: "Perfect for beginners starting their online store",
    price: 19.99,
    durationDays: 30,
    features: [
      "Up to 10 products",
      "Basic store customization",
      "Email support",
      "Sales analytics",
      "Mobile responsive",
    ],
  },
  {
    name: "pro",
    description: "For growing businesses with more needs",
    price: 49.99,
    durationDays: 30,
    features: [
      "Up to 100 products",
      "Advanced store customization",
      "Priority email & chat support",
      "Advanced analytics dashboard",
      "Inventory management",
      "Discount codes",
    ],
  },
  {
    name: "enterprise",
    description: "For established businesses needing maximum features",
    price: 99.99,
    durationDays: 30,
    features: [
      "Unlimited products",
      "Full store customization",
      "24/7 phone support",
      "Real-time analytics",
      "Advanced inventory management",
      "Bulk product imports",
      "API access",
      "Custom domains",
    ],
  },
];

const seedPlans = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/your-database-name");

    // Clear existing plans
    await Plan.deleteMany({});

    // Insert new plans
    await Plan.insertMany(plans);

    console.log("✅ Plans seeded successfully!");
    console.log("📊 Available plans:");
    plans.forEach((plan) => {
      console.log(
        `   - ${plan.name}: $${plan.price}/month (${plan.features.length} features)`
      );
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding plans:", error);
    process.exit(1);
  }
};

seedPlans();
