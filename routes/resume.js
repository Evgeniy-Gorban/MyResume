const express = require("express");
const router = express.Router();
const resumeController = require("../controllers/resume");

router.get("/", resumeController.resume);

module.exports = router;
