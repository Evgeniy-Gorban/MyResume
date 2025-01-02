const express = require("express");
const router = express.Router();
const authController = require("../controllers/Auth/auth");
const { checkLoginAuth } = require("../middleware/checkLoginAuth")

router.get("/register", checkLoginAuth, authController.registerGet);
router.post("/register", authController.registerPost);
router.get("/login", checkLoginAuth, authController.loginGet);
router.post("/login", authController.loginPost);

router.get("/logout", authController.logoutGet);

module.exports = router;
