const { dontImage } = require("../../utils/dontImg");
const Category = require("../../models/Shop/Category");
const Product = require("../../models/Shop/Product");
const User = require("../../models/Auth/User");
const Profile = require("../../models/Shop/Profile");
const Cart = require("../../models/Shop/Cart");


exports.adminPanelGet = async (req, res) => {
    try {
        const { sortUser = "asc", sortCartUser = "asc", sortProduct = "title", sortDirection = "asc" } = req.query

        const users = await User.find().sort({ username: sortUser === "asc" ? 1 : -1 });
        if (!users) return res.status(404).render('error', { message: "Користувач не знайдено" });

        const productSortCriteria = {};
        if (sortProduct === "title") {
            productSortCriteria.title = sortDirection === "asc" ? 1 : -1;
        } else if (sortProduct === "price") {
            productSortCriteria.price = sortDirection === "asc" ? 1 : -1;
        } else if (sortProduct === "category") {
            productSortCriteria.category = sortDirection === "asc" ? 1 : -1;
        }

        const products = await Product.find().populate("category").sort(productSortCriteria);
        if (!products) return res.status(404).render('error', { message: "Продукт не знайдено" });

        const carts = await Cart.find()
            .populate("user", "username")
            .populate({
                path: "products.productId",
                model: "Product",
            })

        if (!carts) return res.status(404).render('error', { message: "Кошик не знайдено" });

        carts.sort((a, b) => {
            const userA = a.user ? a.user.username.toLowerCase() : "";
            const userB = b.user ? b.user.username.toLowerCase() : "";
            if (userA < userB) return sortCartUser === "asc" ? -1 : 1;
            if (userA > userB) return sortCartUser === "asc" ? 1 : -1;
            return 0;
        });

        const categories = await Category.find();
        if (!categories) return res.status(404).render('error', { message: "Категорія не знайдена" });

        res.render("shop/adminPanel", {
            title: "Адмін панель",
            users,
            carts,
            categories,
            products,
            isLoggedIn: !!req.cookies.token,
            userRole: req.user.role,
            isShowAuthButtons: true,
            isShowCreateProductButtons: true,
            currentSort: sortUser,
            currentSortProduct: sortProduct,
            currentSortDirection: sortDirection,
            currentSortCartUser: sortCartUser,
        });
    } catch (error) {
        console.error("Помилка під час завантаження адмін панелі:", error);
        res.status(500).render('error', { message: "Помилка під час завантаження адмін панелі" });
    }
};
exports.addProductGet = async (req, res) => {
    try {
        const categories = await Category.find();

        res.render("shop/productAdd", {
            title: "Додати продукт",
            categories,
            isLoggedIn: !!req.cookies.token,
            isShowAuthButtons: true,
            userRole: req.user.role
        });
    } catch (error) {
        console.error("Помилка при додаванні продукту:", error);
        res.status(500).render('error', { message: "Помилка при додаванні продукту" });
    }
};
exports.addProductPost = async (req, res) => {
    try {
        const { title, description, price, existingCategory, newCategory } = req.body;

        let category = null;

        if (newCategory) {
            category = await Category.findOne({ title: newCategory });
            if (category) {
                return res.status(409).render('error', { message: "Така категорія вже існує" });
            }
            category = new Category({ title: newCategory });
            await category.save();
        } else if (existingCategory) {
            category = await Category.findById(existingCategory);
            if (!category) {
                return res.status(404).render('error', { message: "Категорія не знайдена" });
            }
        } else {
            return res.status(400).render('error', { message: "Не вказано категорію продукту" });
        }

        const existingProduct = await Product.findOne({ title });
        if (existingProduct) {
            return res.status(409).render('error', { message: "Такий продукт вже існує" });
        }

        const imageUrl = req.file ? `/uploads/products/${req.file.filename}` : dontImage();;

        const newProduct = new Product({
            title,
            description,
            price,
            img: imageUrl,
            category: category._id,
        });

        await newProduct.save();
        res.redirect("/shop");
    } catch (error) {
        console.error("Помилка при додаванні продукту:", error);
        res.status(500).render('error', { message: "Помилка при додаванні продукту" });
    }
};
exports.deleteUserDelete = async (req, res) => {
    try {
        const { userId } = req.params;

        await Cart.deleteMany({ user: userId });

        await Profile.findOneAndDelete({ user: userId });

        const user = await User.findByIdAndDelete(userId);
        if (!user) return res.status(404).render('error', { message: "Користувач не знайдено" });

        res.redirect("/shop/admin/panel");
    } catch (error) {
        console.error("Помилка при видаленні користувача:", error);
        res.status(500).render('error', { message: "Помилка при видаленні користувача" });
    }
};
exports.deleteProductFromCartDelete = async (req, res) => {
    try {
        const { userId, productId } = req.params;

        const profile = await Profile.findOne({ user: userId }).populate("cart");
        if (!profile || !profile.cart)
            return res.status(404).render('error', { message: "Профіль або кошик користувача не знайдено" });

        const cart = profile.cart;

        const productIndex = cart.products.findIndex(
            (item) => item.productId.toString() === productId
        );

        if (productIndex === -1)
            return res.status(404).render('error', { message: "Продукт не знайдено у кошику" });

        cart.products.splice(productIndex, 1);

        await cart.save();

        res.redirect("/shop/admin/panel");
    } catch (error) {
        console.error("Помилка при видаленні продукту з корзини користувача:", error);
        res.status(500).render('error', { message: "Помилка при видаленні продукту з корзини користувача" });
    }
};
exports.deleteProductDelete = async (req, res) => {
    try {
        const { productId } = req.params;

        const product = await Product.findByIdAndDelete(productId);
        if (!product) return res.status(404).render('error', { message: "Продукт не знайдено" });

        const carts = await Cart.find({ "products.productId": productId });
        for (const cart of carts) {
            cart.products = cart.products.filter(
                (item) => item.productId.toString() !== productId
            );
            await cart.save();
        }

        res.redirect("/shop/admin/panel");
    } catch (error) {
        console.error("Помилка при видаленні продукту з магазину:", error);
        res.status(500).render('error', { message: "Помилка при видаленні продукту з магазину" });
    }
};
exports.editProductGet = async (req, res) => {
    try {
        const { productId } = req.params;

        const product = await Product.findById(productId).populate("category");
        if (!product) return res.status(404).render('error', { message: "Продукт не знайдено" });

        const categories = await Category.find();

        res.render("shop/productEdit", {
            title: "Редагування продукта",
            product,
            categories,
            isLoggedIn: !!req.cookies.token,
            isShowAuthButtons: true,
            userRole: req.user.role
        });
    } catch (error) {
        console.error("Помилка під час редагування продукту:", error);
        res.status(500).render('error', { message: "Помилка під час редагування продукту" });
    }
};
exports.editProductPut = async (req, res) => {
    try {
        const { productId } = req.params;
        const { title, description, price, img, existingCategory, newCategory } = req.body;

        let product = await Product.findById(productId).populate("category");
        if (!product) return res.status(404).render('error', { message: "Продукт не знайдено" });

        let category;
        if (newCategory) {
            category = await Category.findOne({ title: newCategory });
            if (category) { return res.status(409).render('error', { message: "Така категорія вже існує" }) }

            category = new Category({ title: newCategory });
            await category.save();
        } else if (existingCategory) {
            category = await Category.findById(existingCategory);
            if (!category) { return res.status(404).render('error', { message: "Вибрана категорія не знайдена" }); }
        } else {
            category = product.category;
        }

        let imageUrl = product.img;
        if (req.file) {
            imageUrl = `/uploads/products/${req.file.filename}`;
        }

        const editProduct = await Product.findByIdAndUpdate(
            productId,
            {
                title,
                description,
                price,
                img: imageUrl,
                category: category._id,
            },
            { new: true }
        );
        if (!editProduct) return res.status(404).render('error', { message: "Продукт не знайдено" });

        res.redirect("/shop/admin/panel");
    } catch (error) {
        console.error("Помилка при зміні продукту:", error);
        res.status(500).render('error', { message: "Помилка при зміні продукту:" });
    }
};
