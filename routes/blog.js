const express = require("express");
const router = express.Router();
const blogController = require("../controllers/Blog/blog");
const commentController = require("../controllers/Blog/comment");
const { checkAuth } = require("../middleware/checkAuth");
const uploadBlogImage = require('../middleware/uploadBlogImage')


router.get("/", blogController.viewBlogGet);
router.get("/create", blogController.createBlogGet);
router.post("/create", uploadBlogImage.single("blogImage"), checkAuth, blogController.createBlogPost);
router.get("/:id", checkAuth, blogController.viewBlogIdGet);
router.delete("/delete/:id", checkAuth, blogController.deleteBlogDelete);
router.get("/edit/:id", checkAuth, blogController.editBlogGet);
router.put("/edit/:id", uploadBlogImage.single("blogImage"), checkAuth, blogController.editBlogPut);

router.post("/comment/:id", checkAuth, commentController.createCommentPost);
router.get("/comment/:id/:commentId", checkAuth, commentController.viewIdCommentGet);
router.put("/comment/:id/:commentId", checkAuth, commentController.editCommentPut);
router.delete("/comment/:id/:commentId", checkAuth, commentController.deleteCommentDelete);

module.exports = router;
