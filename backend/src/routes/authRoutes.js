const express = require("express");
const { registerUser , loginUser , getCurrentUser, logoutUser } = require("../controllers/authController");
const verifyAuth = require("../middleware/verifyAuth");
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", verifyAuth, getCurrentUser);
router.post("/logout", verifyAuth, logoutUser);
module.exports = router;