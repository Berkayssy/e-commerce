const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/google", authController.googleLogin);
router.get("/dashboard", authMiddleware, (req, res) => {
    res.json({ message: `Welcome user with ID: ${req.user.id}` })
});
router.post("/logout", authController.logout);

module.exports = router;