const User = require("../models/User");

module.exports = async function verifySeller(req, res, next) {
  if (req.user.role !== "seller") {
    return res
      .status(403)
      .json({ error: "Unauthorized: User is not a seller" });
  }
  next();
};
