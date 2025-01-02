const Blog = require("../../models/Blog/Blog");
const Comment = require("../../models/Blog/Comment");
const { validateComment } = require("../../validation/blog/commentValidation");

exports.createCommentPost = async (req, res) => {
  try {
    const { text } = req.body;

    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).render('error', { message: "Блог не знайдено" });
    }

    const errorMessage = validateComment(req.body);
    if (errorMessage) {
      const comments = await Comment.find({ blog: blog._id }).populate(
        "user",
        "username"
      );

      const isShowCommentPutButton = comments.map((comment) => ({
        ...comment.toObject(),
        isShowCommentPutButton: comment.user._id.toString() === req.user.id,
      }));

      return res.status(400).render("blog/blogId", {
        blog,
        comments: isShowCommentPutButton,
        errorMessage,
        isLoggedIn: !!req.cookies.token,
        isShowAuthButtons: true,
      });
    }

    const newComment = new Comment({
      text,
      user: req.user.id,
      blog: blog._id,
      createdAt: new Date(),
    });

    await newComment.save();

    res.redirect(`/blog/${blog._id}`);
  } catch (error) {
    console.error("Помилка при створенні коментаря:", error);
    res.status(500).render('error', { message: "Помилка при створенні коментаря" });
  }
};
exports.viewIdCommentGet = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).render('error', { message: "Блог не знайдено" });
    }

    const comments = await Comment.findById(req.params.commentId);
    if (!comments) {
      return res.status(404).render('error', { message: "Коментар не знайдено" });
    }

    res.render("blog/comments/commentEdit", {
      title: "Редагування коментаря",
      blog,
      comments,
    });
  } catch (error) {
    console.error("Помилка при редагуванні коментаря:", error);
    res.status(500).render('error', { message: "Помилка при редагуванні коментаря" });
  }
};
exports.editCommentPut = async (req, res) => {
  try {
    const { text } = req.body;

    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).render('error', { message: "Блог не знайдено" });
    }

    const comments = await Comment.findByIdAndUpdate(req.params.commentId,
      { text },
      { new: true }
    );
    if (!comments) {
      return res.status(404).render('error', { message: "Коментар не знайдено" });
    }

    const errorMessage = validateComment(req.body);
    if (errorMessage) {
      return res.status(400).render("blog/comments/commentEdit", {
        title: "Редагування коментаря",
        blog,
        comments,
        errorMessage,
        isLoggedIn: !!req.cookies.token,
        isShowAuthButtons: true,
      });
    }

    await comments.save();

    res.redirect(`/blog/${blog._id}`);
  } catch (error) {
    console.error("Помилка при редагуванні коментаря:", error);
    res.status(500).render('error', { message: "Помилка при редагуванні коментаря" });
  }
};
exports.deleteCommentDelete = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).render('error', { message: "Блог не знайдено" });
    }

    const comment = await Comment.findByIdAndDelete(req.params.commentId);
    if (!comment) {
      return res.status(404).render('error', { message: "Коментар не знайдено" });
    }

    blog.comments = blog.comments.filter(
      (comment) => comment._id.toString() !== req.params.commentId
    );

    await blog.save();

    res.redirect(`/blog/${blog._id}`);
  } catch (error) {
    console.error("Помилка при видаленні коментаря:", error);
    res.status(500).render('error', { message: "Помилка при видаленні коментаря" });
  }
};

