const mongoose = require("mongoose");
const User = require("../../models/User");
const Seller = require("../../models/Seller");
const Community = require("../../models/Community");
const Subscription = require("../../models/Subscription");

const slugify = require("../../utils/slugify");
const fileparser = require("../../utils/fileparser");
const { createError, errorHandler } = require("../../utils/errorHandler");

const orderService = require("../order/orders.service");
const userService = require("../auth/auth.service"); // or user.service.js

exports.createCommunity = async ({ name, transId, rootAdminId, role }) => {
  try {
    // ✅ ID'yi ilk önce kontrol et
    if (!mongoose.Types.ObjectId.isValid(rootAdminId)) {
      return { status: 404, success: false, message: "Invalid rootAdminId" };
    }

    const rootAdmin = await User.findById(rootAdminId);
    if (!rootAdmin) {
      return { status: 404, success: false, message: "Root admin not found" };
    }

    const slug = slugify(name);
    return { status: 201, success: true, data: { name, slug, transId, role } };
  } catch (error) {
    if (error instanceof mongooe.Error.CastError) {
      return { status: 404, success: false, message: "Community not found" };
    }
    return errorHandler(error, "createCommunity");
  }
};

exports.getCommunities = async (filters = {}) => {
  const query = {};
  if (filters.search) query.name = { $regex: filters.search, $options: "i" };

  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 10;
  const skip = (page - 1) * limit;

  const [communities, total] = await Promise.all([
    Community.find(query)
      .skip(skip)
      .limit(limit)
      .select("name transId _id logo description"),
    Community.countDocuments(query),
  ]);

  return {
    communities,
    total,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
  };
};

exports.createOnboardingStore = async (req) => {
  const { name, plan, description } = req.body;

  if (!name || !plan)
    throw errorHandler(
      "Missing required fields: name and plan are required.",
      400
    );

  const logoObj = req.file ? fileparser.parseFile(req.file) : null;
  const transId = slugify(name) + "-" + Date.now();

  const owner = req.user?.id;
  if (!owner) throw errorHandler("Unauthorized: owner not found.", 401);

  const seller = await Seller.findOne({ userId: owner });
  if (!seller) throw errorHandler("Seller profile not found.", 404);

  const community = new Community({
    name,
    transId,
    owner,
    rootAdmin: owner,
    admins: [],
    role: "seller",
    plan,
    logo: logoObj,
    description: description || "",
  });

  await community.save();

  const subscription = await Subscription.findById(seller.subscriptionId);
  if (subscription) {
    subscription.store = community._id;
    await subscription.save();
  }

  seller.storeId = community._id;
  await seller.save();

  community.subscription = seller.subscriptionId;
  await community.save();

  return { community, subscription, seller };
};

exports.getDashboardStats = async () => {
  try {
    const totalOrders = await orderService.countOrders();
    const totalRevenue = await orderService.calculateTotalRevenue();
    const totalUsers = await userService.countUsers();
    const topProducts = await orderService.getTopSellingProducts(5);

    return { totalOrders, totalRevenue, totalUsers, topProducts };
  } catch (err) {
    throw createError(
      "Failed to retrieve dashboard statistics.",
      500,
      err.message
    );
  }
};

exports.getCommunityDetails = async (communityId) => {
  const community = await Community.findById(communityId).populate(
    "rootAdmin admins",
    "username email"
  );
  if (!community) throw createError("Community not found", 404);
  return community;
};

exports.addAdminToCommunity = async ({ communityId, adminId, userId }) => {
  const community = await Community.findById(communityId);
  if (!community) throw createError("Community not found", 404);

  if (String(userId) !== String(community.rootAdmin))
    throw createError("Only root admin can add admins.", 403);

  if (!community.admins.includes(adminId)) {
    community.admins.push(adminId);
    await community.save();
  }

  return community;
};
