const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/Auth/User");

async function createAdminIfNotExists() {
  try {
    await mongoose.connect(
      `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.winiz.mongodb.net/${process.env.DB_name}?retryWrites=true&w=majority&appName=Cluster0`
    );

    const existingAdmin = await User.findOne({ role: "admin" });

    if (existingAdmin) {
      console.log("Користувач адмін вже існує");
      return;
    }

    const adminData = {
      username: "admin",
      password: "adminpassword",
      role: "admin",
    };

    const hashedPassword = await bcrypt.hash(adminData.password, 10);
    adminData.password = hashedPassword;

    const admin = new User(adminData);

    await admin.save();
    console.log("Користувач адмін успішно створено");
  } catch (error) {
    console.error("Помилка при створенні користувача адміну:", error);
  }
}

module.exports = createAdminIfNotExists;
