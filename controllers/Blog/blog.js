const Blog = require("../../models/Blog/Blog");
const Comment = require("../../models/Blog/Comment");
const { dontImage } = require("../../utils/dontImg");
const { validateBlog } = require("../../validation/blog/blogValidation");

exports.viewBlogGet = async (req, res) => {
  try {
    const blogs = await Blog.find().populate("user", "username");

    res.render("blog/blog", {
      title: "Блог",
      blogs,
      isLoggedIn: !!req.cookies.token,
      isShowAuthButtons: true,
      isShowCreatePostButtons: true,
    });
  } catch (error) {
    console.error("Помилка при перегляді списку блогів:", error);
    res.status(500).render('error', { message: "Помилка при перегляді списку блогів" });
  }
};
exports.createBlogGet = (req, res) => {
  try {
    res.render("blog/createBlog", {
      title: "Блог",
      isLoggedIn: !!req.cookies.token,
      isShowAuthButtons: true,
    });
  } catch (error) {
    console.error("Помилка при створенні блогу:", error);
    res.status(500).render('error', { message: "Помилка при створенні блогу" });
  }
};
exports.createBlogPost = async (req, res) => {
  try {
    const { title, description } = req.body;

    const errorMessage = validateBlog(req.body);
    if (errorMessage) {
      return res.status(400).render("blog/createBlog", {
        errorMessage,
        isLoggedIn: !!req.cookies.token,
        isShowAuthButtons: true,
      });
    }

    const blog = await Blog.findOne({ title });
    if (blog) {
      return res.status(409).render("blog/createBlog", {
        title: "Блог",
        errorMessage: { title: "Блог з цим тітулом вже існує" },
        isLoggedIn: !!req.cookies.token,
        isShowAuthButtons: true,
      });
    }

    const imageUrl = req.file ? `/uploads/blogs/${req.file.filename}` : dontImage();

    const newBlog = new Blog({
      title,
      description,
      img: imageUrl,
      user: req.user.id,
      createdAt: new Date(),
    });

    await newBlog.save();

    res.redirect("/blog");
  } catch (error) {
    console.error("Помилка при створенні блогу:", error);
    res.status(500).render('error', { message: "Помилка при створенні блогу" });
  }
};
exports.viewBlogIdGet = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate("user", "username");
    if (!blog) {
      return res.status(404).render('error', { message: "Блог не знайдено" });
    }

    const comments = await Comment.find({ blog: blog._id }).populate("user", "username");

    const isShowDeleteButton = req.user && blog.user._id.toString() === req.user.id;
    const isShowPutButton = req.user && blog.user._id.toString() === req.user.id;

    const isShowCommentPutButton = comments.map((comment) => ({
      ...comment.toObject(),
      isShowCommentPutButton: comment.user._id.toString() === req.user.id,
    }));

    res.render("blog/blogId", {
      title: "Блог",
      blog,
      comments: isShowCommentPutButton,
      isLoggedIn: !!req.cookies.token,
      isShowDeleteButton,
      isShowPutButton,
      isShowAuthButtons: true,
    });
  } catch (error) {
    console.error("Помилка при виборі блогу за ID:", error);
    res.status(500).render('error', { message: "Помилка при виборі блогу за ID" });
  }
};
exports.deleteBlogDelete = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) {
      return res.status(404).render('error', { message: "Блог не знайдено" });
    }

    if (blog.user.toString() !== req.user.id.toString()) {
      return res.status(403).render('error', { message: "Ви не можете видалити цей блог" });
    }

    res.redirect("/blog");
  } catch (error) {
    console.error("Помилка при видаленні блогу:", error);
    res.status(500).render('error', { message: "Помилка при видаленні блогу" });
  }
};
exports.editBlogGet = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).render('error', { message: "Блог не знайдено" });
    }

    res.render("blog/blogUpdate", {
      title: "Редагування блогу",
      blog
    });
  } catch (error) {
    console.error("Помилка при зміні блогу:", error);
    res.status(500).render('error', { message: "Помилка при зміні блогу" });
  }
};
exports.editBlogPut = async (req, res) => {
  try {
    const { title, description } = req.body;

    const blogForImage = await Blog.findById(req.params.id);
    if (!blogForImage) {
      return res.status(404).render('error', { message: "Блог не знайдено" });
    }

    const blog = await Blog.findByIdAndUpdate(req.params.id, {
      title: title || undefined,
      description: description || undefined,
      img: req.file ? `/uploads/blogs/${req.file.filename}` : blogForImage.img || undefined,
    },
      { new: true }
    );
    if (!blog) {
      return res.status(404).render('error', { message: "Блог не знайдено" });
    }

    if (blog.user.toString() !== req.user.id.toString()) {
      return res.status(403).render('error', { message: "Ви не можете змінити цей блог" });
    }

    const errorMessage = validateBlog(req.body);
    if (errorMessage) {
      return res.status(400).render("blog/blogUpdate", { errorMessage, blog });
    }

    await blog.save();

    res.redirect(`/blog/${blog._id}`);
  } catch (error) {
    console.error("Помилка при зміні блогу:", error);
    res.status(500).render('error', { message: "Помилка при зміні блогу" });
  }
};
