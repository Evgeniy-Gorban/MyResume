const path = require('path');
const fs = require('fs');
const { dontImage } = require("../../utils/dontImg");
const Category = require("../../models/Shop/Category");
const Product = require("../../models/Shop/Product");
const User = require("../../models/Auth/User");
const Profile = require("../../models/Shop/Profile");
const Cart = require("../../models/Shop/Cart");

exports.viewShopGet = async (req, res) => {
  try {
    const categories = await Category.find();

    const filter = {};
    const selectedCategory = req.query.category;
    if (selectedCategory) filter.category = selectedCategory

    const page = parseInt(req.query.page) || 1
    const limit = 6
    const skip = (page - 1) * limit

    const [products, totalProducts] = await Promise.all([
      Product.find(filter)
        .populate("category")
        .skip(skip)
        .limit(limit),
      Product.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalProducts / limit)

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

    res.render("shop/shop", {
      title: "Магазин",
      categories,
      products,
      user: req.user,
      isLoggedIn: !!req.cookies.token,
      isShowAuthButtons: true,
      isShowProfileButtons: true,
      userRole: req.user ? req.user.role : "guest",
      currentPage: page,
      totalPages,
      pages,
      selectedCategory
    });
  } catch (error) {
    console.error("Помилка при перегляді списку магазина", error);
    res.status(500).render('error', { message: "Помилка при перегляді списку магазина" });
  }
};
exports.profileShopGet = async (req, res) => {
  try {
    const username = req.params.username;
    const user = await User.findOne({ username });

    if (!user) return res.status(404).render('error', { message: "Користувач не знайдено" });

    if (req.user.username !== username) {
      return res.status(403).render('error', { message: "У вас немає прав для доступу до цього профілю" });
    }

    let profile = await Profile.findOne({ user: user._id, }).populate({
      path: "cart",
      populate: {
        path: "products.productId",
        model: "Product",
      },
    });
    if (!profile) {
      const newCart = new Cart({ user: user._id, products: [] });
      const savedCart = await newCart.save();

      profile = new Profile({
        user: user._id,
        cart: savedCart._id,
        img: dontImage(),
      });

      await profile.save();
    }

    const imageUrl = profile?.img || dontImage();

    let totalQuantity = 0;
    let totalPrice = 0;

    if (profile?.cart?.products?.length) {
      profile.cart.products.forEach((item) => {
        totalQuantity += item.quantity;
        totalPrice += item.quantity * item.productId.price;
      });
    }

    res.render("shop/profile", {
      title: "Профіль",
      user,
      profile,
      img: imageUrl,
      totalQuantity,
      totalPrice,
      isLoggedIn: !!req.cookies.token,
      isShowAuthButtons: true,
    });
  } catch (error) {
    console.error("Помилка під час перегляду профілю користувача:", error);
    res.status(500).render('error', { message: "Помилка під час перегляду профілю користувача" });
  }
};
exports.profilePhotoPost = async (req, res) => {
  try {
    const username = req.params.username;

    const user = await User.findOne({ username });
    if (!user) return res.status(404).render('error', { message: "Користувач не знайдено" });

    const profile = await Profile.findOne({ user: user._id });
    if (!profile) return res.status(404).render('error', { message: "Профіль не знайдено" });

    if (req.file && req.file.filename) {
      if (profile.img !== "uploads/dontImg.jpeg") {
        const oldPath = path.join(__dirname, "../public", profile.img);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      profile.img = `/uploads/profiles/${req.file.filename}`;
    }

    await profile.save();

    res.redirect(`/shop/profile/${username}`)
  } catch (error) {
    console.error("Помилка завантаження зображення:", error);
    res.status(500).render('error', { message: "Помилка завантаження зображення" });
  }
}

exports.addToCartPost = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).render('error', { message: "Користувача не знайдено" });

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).render('error', { message: "Продукт не знайдено" });
    }

    let profile = await Profile.findOne({ user: userId }).populate("cart");
    if (!profile) {
      const newCart = new Cart({
        user: userId,
        products: [{ productId, quantity: 1 }],
      });
      const savedCart = await newCart.save();

      profile = new Profile({
        user: userId,
        cart: savedCart._id,
        img: dontImage(),
      });

      await profile.save();

      return res.redirect(`/shop/profile/${user.username}`);
    }

    let cart = profile.cart;

    if (!cart) {
      cart = new Cart({ user: userId, products: [{ productId, quantity: 1 }] });
      profile.cart = cart._id;

      await cart.save();

      await profile.save();
    } else {
      const existingProduct = cart.products.find(
        (item) => item.productId.toString() === productId
      );

      if (existingProduct) {
        existingProduct.quantity += 1;
      } else {
        cart.products.push({ productId, quantity: 1 });
      }

      await cart.save();
    }

    res.redirect(`/shop/profile/${user.username}`);
  } catch (error) {
    console.error("Помилка при додаванні продукту до кошика:", error);
    res.status(500).render('error', { message: "Помилка при додаванні продукту до кошика" });
  }
};
exports.updateProductToCartPut = async (req, res) => {
  try {
    const { productId, action } = req.body;
    const { username } = req.user;

    const user = await User.findOne({ username });
    if (!user) return res.status(404).render('error', { message: "Користувача не знайдено" });

    let profile = await Profile.findOne({ user: user._id }).populate("cart");
    if (!profile || !profile.cart)
      return res.status(404).render('error', { message: "Кошик не знайдено" });

    let cart = profile.cart;
    const product = cart.products.find(
      (item) => item.productId.toString() === productId
    );

    if (!product) return res.status(404).render('error', { message: "Продукт у кошику не знайдено" });

    if (action === "increase") {
      product.quantity += 1;
    } else if (action === "decrease") {
      if (product.quantity > 1) {
        product.quantity -= 1;
      } else {
        cart.products = cart.products.filter(
          (item) => item.productId.toString() !== productId
        );
      }
    } else {
      return res.status(400).render('error', { message: "Неправильна дія добавлення/зменшення кількості продуктів" });
    }

    await cart.save();

    res.redirect(`/shop/profile/${user.username}`);
  } catch (error) {
    console.error("Помилка при оновленні кількості товару:", error);
    res.status(500).render('error', { message: "Помилка при оновленні кількості товару" });
  }
};
exports.removeProductToCartDelete = async (req, res) => {
  try {
    const { productId } = req.body;
    const { username } = req.user;

    const user = await User.findOne({ username });
    if (!user) return res.status(404).render('error', { message: "Користувач не знайдено" });

    let profile = await Profile.findOne({ user: user._id }).populate("cart");
    if (!profile || !profile.cart)
      return res.status(404).render('error', { message: "Кошик не знайдено" });

    let cart = profile.cart;
    const productIndex = cart.products.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (productIndex === -1) {
      console.log("Продукт у кошику не знайдено");
      return res.status(404).render('error', { message: "Продукт у кошику не знайдено" });
    }

    cart.products.splice(productIndex, 1);

    await cart.save();

    res.redirect(`/shop/profile/${user.username}`);
  } catch (error) {
    console.error("Помилка при видаленні товару з кошика:", error);
    res.status(500).render('error', { message: "Помилка при видаленні товару з кошика" });
  }
};

exports.placingOrderGet = async (req, res) => {
  try {
    res.render("shop/placingOrder", {
      tltlge: "Оформлення",
      user: req.user,
      isLoggedIn: !!req.cookies.token,
      isShowAuthButtons: true,
      isShowProfileButtons: true,
    });
  } catch (error) {
    console.error("Помилка при оформленні замовлення:", error);
    res.status(500).render('error', { message: "Помилка при оформленні замовлення" });
  }
};


