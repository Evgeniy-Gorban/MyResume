const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/Auth/User");

async function createAdminIfNotExists(mongoose) {
  try {
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
