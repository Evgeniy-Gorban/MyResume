const express = require("express");
const router = express.Router();
const chatController = require("../controllers/Chat/chat");
const { checkAuth } = require("../middleware/checkAuth");

router.get("/", checkAuth, chatController.chatGet);

module.exports = router;
