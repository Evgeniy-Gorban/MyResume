const User = require("../../models/Auth/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validateRegister } = require("../../validation/auth/registerValidation");
const { validateLogin } = require("../../validation/auth/loginValidation");


exports.registerGet = (req, res) => {
  try {
    res.render("auth/register", {
      title: "Реєстрація",
    });
  } catch (error) {
    console.log("Помилка під час реєстрації:", error);
    res.status(500).render('error', { message: "Помилка під час реєстрації" });
  }
};
exports.registerPost = async (req, res) => {
  try {
    const errorMessage = validateRegister(req.body);
    if (errorMessage) {
      return res.status(400).render("auth/register", { errorMessage });
    }

    const { username, password } = req.body;

    const candidate = await User.findOne({ username });

    if (candidate) {
      return res.status(409).render("auth/register", {
        errorMessage: "Такий користувач вже існує",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = await User({
      username,
      password: hashPassword,
    });

    await newUser.save();

    res.status(201).render("auth/login");
  } catch (error) {
    console.log("Помилка під час реєстрації:", error);
    res.status(500).render('error', { message: "Помилка під час реєстрації" });
  }
};
exports.loginGet = (req, res) => {
  try {
    res.render("auth/login", {
      title: "Логін",
    });
  } catch (error) {
    console.log("Помилка при логіну:", error);
    res.status(500).render('error', { message: "Помилка при логіну" });
  }
};
exports.loginPost = async (req, res) => {
  try {
    const errorMessage = validateLogin(req.body);
    if (errorMessage) {
      return res.status(400).render("auth/login", { errorMessage });
    }

    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).render("auth/login", {
        errorMessage: { username: "Неправильний логін користувача або пароль" },
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).render("auth/login", {
        errorMessage: { password: "Неправильний логін користувача або пароль" },
      });
    }

    const token = jwt.sign(
      { id: user._id, username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" });

    res.cookie("token", token, {
      httpOnly: true,
      //secure: false,
      maxAge: 86400000,
    });
    res.status(200).redirect("/");
  } catch (error) {
    console.log("Помилка при логіну:", error);
    res.status(500).render('error', { message: "Помилка при логіну" });
  }
};

exports.logoutGet = (req, res) => {
  try {
    res.clearCookie("token");

    res.status(200).redirect("/");
  } catch (error) {
    console.log("Помилка при виході:", error);
    res.status(500).render('error', { message: "Помилка при виході" });
  }
};
