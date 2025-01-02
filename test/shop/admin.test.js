const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../index");
const { MongoMemoryServer } = require("mongodb-memory-server");
const chai = require("chai");
const expect = chai.expect;
const cheerio = require('cheerio');
const bcrypt = require("bcryptjs")
require('dotenv').config({ path: '.env.test' });
const User = require("../../models/Auth/User");
const Product = require("../../models/Shop/Product");
const Category = require("../../models/Shop/Category");
const Profile = require("../../models/Shop/Profile");
const Cart = require("../../models/Shop/Cart");


let mongoServer;
let server;
let cookies;
let user;
let newUser;
let newCookies;

const addTestCategory = async () => {
    const category = new Category({
        title: "Тест категорія"
    });
    await category.save();
    return category;
}
const addTestProduct = async (categoryId) => {
    const product = new Product({
        title: "Тест продукт",
        description: "Тест опис продукту",
        price: 1000,
        img: "/uploads/dontImg.jpeg",
        category: categoryId
    });
    await product.save();
    return product;
}

const registerTestUser = async (username, password) => {
    return await request(app)
        .post("/auth/register")
        .send({ username, password })
}
const loginTestUser = async (username, password) => {
    return await request(app)
        .post("/auth/login")
        .send({ username, password })
}
const createTestAdmin = async () => {
    const adminTest = await User.findOne({ role: "admin" });

    if (adminTest) {
        return;
    }

    const adminData = {
        username: "admin",
        password: "admin",
        role: "admin",
    };

    const hashedPassword = await bcrypt.hash(adminData.password, 10);
    adminData.password = hashedPassword;

    const admin = new User(adminData);

    await admin.save();
};

describe("Тест адміну у магазині", () => {
    before(async () => {
        if (process.env.NODE_ENV === "test") {
            mongoServer = await MongoMemoryServer.create();
            const uri = mongoServer.getUri();
            if (mongoose.connection.readyState === 0) {
                await mongoose.connect(uri);
            }
        }
        server = app.listen(3001, () => {
            console.log('Тест сервер запустився на PORT: 3001');
        })

        await createTestAdmin()

        const loginTest = await loginTestUser("admin", "admin")
        cookies = loginTest.headers['set-cookie']
        user = await User.findOne({ username: "admin" })


        await registerTestUser("newtestuser", "newtestpassword")
        const newUserLogin = await loginTestUser("newtestuser", "newtestpassword")
        newCookies = newUserLogin.headers['set-cookie']
        newUser = await User.findOne({ username: "newtestuser" })
    });

    beforeEach(async () => {
        await Category.deleteMany();
        await Product.deleteMany();
        await Profile.deleteMany();
        await Cart.deleteMany();
    });

    after(async () => {
        server.close();
        await mongoose.disconnect();
        if (mongoServer) {
            await mongoServer.stop();
        }
    });

    describe("GET /shop/admin/panel", () => {
        it("Повинен повернути сторінку адмін панелі", async () => {
            const response = await request(app)
                .get("/shop/admin/panel")
                .set("Cookie", cookies)

            expect(response.status).to.equal(200);

            expect(response.text).to.include("Адмін панель");
            expect(response.text).to.include("Користувачі");
            expect(response.text).to.include("Кошики користувачів");
            expect(response.text).to.include("Продукти у магазині");
        });
        it("Повинен сортувати користувачів по імені", async () => {
            const response = await request(app)
                .get("/shop/admin/panel")
                .set("Cookie", cookies)
                .query({ sortUser: "desc", sortCartUser: "asc", sortProduct: "title", sortDirection: "asc" });

            expect(response.status).to.equal(200);

            const $ = cheerio.load(response.text);
            const userNames = [];

            $(".list-item span").each((i, el) => {
                userNames.push($(el).text().trim());
            });

            const sortedUserNames = [...userNames].sort().reverse();
            expect(userNames).to.deep.equal(sortedUserNames);
        });
        it("Повинен сортувати кошики користувачів по імені власника", async () => {
            const user1 = new User({ username: "Тест 1" });
            const user3 = new User({ username: "Тест 3" });
            const user2 = new User({ username: "Тест 2" });

            await user1.save();
            await user2.save();
            await user3.save();

            const cart1 = new Cart({ user: user1._id, products: [] });
            const cart2 = new Cart({ user: user2._id, products: [] });
            const cart3 = new Cart({ user: user3._id, products: [] });

            await cart1.save();
            await cart2.save();
            await cart3.save();

            const response = await request(app)
                .get("/shop/admin/panel")
                .set("Cookie", cookies)
                .query({ sortCartUser: "asc" });

            expect(response.status).to.equal(200);

            const $ = cheerio.load(response.text);
            const cartTitles = $(".cart-title").map((i, el) => $(el).text()).get();

            expect(cartTitles).to.deep.equal([
                "Кошик користувача: Тест 1",
                "Кошик користувача: Тест 2",
                "Кошик користувача: Тест 3"
            ]);
        });
        it("Повинен сортувати продукти", async () => {
            const category = await addTestCategory()
            const categoryId = category._id.toString()

            const product1 = new Product({
                title: "Тест 1",
                description: "Тест 1 опис",
                price: 100,
                img: "/uploads/product1.jpg",
                category: categoryId
            });
            const product2 = new Product({
                title: "Тест 3",
                description: "Тест 3 опис",
                price: 200,
                img: "/uploads/product2.jpg",
                category: categoryId
            });
            const product3 = new Product({
                title: "Тест 2",
                description: "Тест 2 опис",
                price: 150,
                img: "/uploads/product3.jpg",
                category: categoryId
            });

            await product1.save();
            await product2.save();
            await product3.save();

            const response = await request(app)
                .get("/shop/admin/panel")
                .set("Cookie", cookies)
                .query({ sortProduct: "price", sortDirection: "asc" });

            expect(response.status).to.equal(200);

            const $ = cheerio.load(response.text);
            const productPrice = $(".list-item")
                .filter((i, el) => $(el).text().includes("Ціна:"))
                .map((i, el) => {
                    const priceText = $(el).text().match(/Ціна:\s*(\d+)\s*грн\./);
                    return parseInt(priceText[1])
                })
                .get();

            expect(productPrice).to.deep.equal([100, 150, 200]);
        });
    });
    describe("GET /shop/admin/product/add", () => {
        it("Повинен відображати сторінку додавання продукту з категоріями", async () => {
            await addTestCategory()

            const response = await request(app)
                .get("/shop/admin/product/add")
                .set("Cookie", cookies);

            expect(response.status).to.equal(200);

            expect(response.text).to.include("Додати продукт");
            expect(response.text).to.include("Назва продукту");
            expect(response.text).to.include("Опис");
            expect(response.text).to.include("Ціна");
            expect(response.text).to.include("Фото продукту");
            expect(response.text).to.include("Виберіть потрібну категорію");
        });
    });
    describe("POST /shop/admin/product/add", () => {
        it("Повинен додати новий продукт із існуючою категорією", async () => {
            const category = await addTestCategory()
            const categoryId = category._id.toString()

            const response = await request(app)
                .post("/shop/admin/product/add")
                .set("Cookie", cookies)
                .send({
                    title: "Тест продукт",
                    description: "Тест опис продукту",
                    price: 1000,
                    existingCategory: categoryId,
                    img: "/uploads/dontImg.jpeg"
                });

            expect(response.status).to.equal(302);
            expect(response.headers.location).to.equal("/shop");
        });
        it("Повинен додати новий продукт із новою категорією", async () => {
            const response = await request(app)
                .post("/shop/admin/product/add")
                .set("Cookie", cookies)
                .send({
                    title: "Тест продукт",
                    description: "Тест опис продукту",
                    price: 500,
                    newCategory: "Тест нова категорія",
                    img: "/uploads/dontImg.jpeg"
                });

            expect(response.status).to.equal(302);
            expect(response.headers.location).to.equal("/shop");

            const newCategory = await Category.findOne({ title: "Тест нова категорія" })
            expect(newCategory).to.not.be.null;
        });
        it("Повинен повернути 400, якщо категорія (існуюча чи нова) не вказана", async () => {
            const response = await request(app)
                .post("/shop/admin/product/add")
                .set("Cookie", cookies)
                .send({
                    title: "Тест продукт",
                    description: "Тест опис продукту",
                    price: 1000,
                    img: "/uploads/dontImg.jpeg"
                });

            expect(response.status).to.equal(400);
            expect(response.text).to.include("Не вказано категорію продукту");
        });
        it("Повинен повернути 404, якщо категорію не знайдено", async () => {
            const ivalidCategoryId = "123456789012345678901234"

            const response = await request(app)
                .post("/shop/admin/product/add")
                .set("Cookie", cookies)
                .send({
                    title: "Тест продукт",
                    description: "Тест опис продукту",
                    price: 1000,
                    existingCategory: ivalidCategoryId,
                    img: "/uploads/dontImg.jpeg"
                });

            expect(response.status).to.equal(404);
            expect(response.text).to.include("Категорія не знайдена");
        });
        it("Повинен повернути 409, якщо назва нової категорії вже існує", async () => {
            await addTestCategory()

            const response = await request(app)
                .post("/shop/admin/product/add")
                .set("Cookie", cookies)
                .send({
                    title: "Тест продукт",
                    description: "Тест опис продукту",
                    price: 1000,
                    newCategory: "Тест категорія",
                    img: "/uploads/dontImg.jpeg"
                });

            expect(response.status).to.equal(409);
            expect(response.text).to.include("Така категорія вже існує");
        });
        it("Повинен повернути 409, якщо продукт із такою назвою вже існує", async () => {
            const category = await addTestCategory()
            const categoryId = category._id.toString()

            const existingProduct = new Product({
                title: "Тест продукт",
                description: "Тест опис продукту",
                price: 1000,
                img: "/uploads/dontImg.jpeg",
                category: categoryId
            });
            await existingProduct.save();

            const response = await request(app)
                .post("/shop/admin/product/add")
                .set("Cookie", cookies)
                .send({
                    title: "Тест продукт",
                    description: "Тест опис продукту",
                    price: 1000,
                    existingCategory: categoryId,
                    img: "/uploads/dontImg.jpeg"
                });

            expect(response.status).to.equal(409);
            expect(response.text).to.include("Такий продукт вже існує");
        });
    });
    describe("DELETE /shop/admin/user/delete/:userId", () => {
        it("Повинен видалити користувача та його кошик із продуктами", async () => {
            const user = newUser
            const userId = user._id

            const cart = new Cart({ user: userId, products: [] });
            await cart.save();

            const response = await request(app)
                .delete(`/shop/admin/user/delete/${userId}`)
                .set('Cookie', cookies);

            expect(response.status).to.equal(302);
            expect(response.headers.location).to.equal('/shop/admin/panel')

            const deletedUser = await User.findById(userId);
            expect(deletedUser).to.be.null;

            const deletedCart = await Cart.findOne({ user: userId });
            expect(deletedCart).to.be.null;
        })
        it("Повинен повернути 404, якщо користувач не знайдено", async () => {
            const validUserId = "123456789012345678901234"

            const cart = new Cart({ user: validUserId, products: [] });
            await cart.save();

            const response = await request(app)
                .delete(`/shop/admin/user/delete/${validUserId}`)
                .set('Cookie', cookies);

            expect(response.status).to.equal(404);

            const deletedUser = await User.findById(validUserId);
            expect(deletedUser).to.be.null;

            const deletedCart = await Cart.findOne({ user: validUserId });
            expect(deletedCart).to.be.null;
        })
    })
    describe("DELETE /shop/admin/cart/product/delete/:userId/:productId", () => {
        it("Повинен видалити продукт із кошика користувача", async () => {
            const category = await addTestCategory()
            const categoryId = category._id.toString()

            const product = await addTestProduct(categoryId)
            const productId = product._id.toString()

            const user = newUser
            const userId = user._id.toString()

            const cart = new Cart({ user: userId, products: [{ productId }] });
            await cart.save();
            const profile = new Profile({
                user: userId,
                cart: cart._id,
                img: "/uploads/dontImg.jpeg"
            });
            await profile.save();

            const response = await request(app)
                .delete(`/shop/admin/cart/product/delete/${userId}/${productId}`)
                .set("Cookie", cookies);

            expect(response.status).to.equal(302);
            expect(response.headers.location).to.equal("/shop/admin/panel");

            const updatedCart = await Cart.findById(cart._id);
            expect(updatedCart.products).to.have.lengthOf(0);
        });
        it("Повинен повернути 404, якщо продукт не знайдений у кошику", async () => {
            const category = await addTestCategory()
            const categoryId = category._id.toString()

            const product = await addTestProduct(categoryId)
            const productId = product._id.toString()

            const user = newUser
            const userId = user._id.toString()

            const cart = new Cart({ user: userId, products: [] });
            await cart.save();
            const profile = new Profile({
                user: userId,
                cart: cart._id,
                img: "/uploads/dontImg.jpeg"
            });
            await profile.save();

            const response = await request(app)
                .delete(`/shop/admin/cart/product/delete/${userId}/${productId}`)
                .set("Cookie", cookies);

            expect(response.status).to.equal(404);
            expect(response.text).to.include("Продукт не знайдено у кошику");
        });
        it("Повинен повернути 404, якщо кошик не знайдено", async () => {
            const category = await addTestCategory()
            const categoryId = category._id.toString()

            const product = await addTestProduct(categoryId)
            const productId = product._id.toString()

            const user = newUser
            const userId = user._id.toString()

            const profile = new Profile({
                user: userId,
                cart: undefined,
                img: "/uploads/dontImg.jpeg"
            });
            await profile.save();

            const response = await request(app)
                .delete(`/shop/admin/cart/product/delete/${userId}/${productId}`)
                .set("Cookie", cookies);

            expect(response.status).to.equal(404);
            expect(response.text).to.include("Профіль або кошик користувача не знайдено");
        });
        it("Повинен повернути 404, якщо профіль не знайдено", async () => {
            const category = await addTestCategory()
            const categoryId = category._id.toString()

            const product = await addTestProduct(categoryId)
            const productId = product._id.toString()

            const user = newUser
            const userId = user._id.toString()

            const cart = new Cart({ user: userId, products: [] });
            await cart.save();

            const response = await request(app)
                .delete(`/shop/admin/cart/product/delete/${userId}/${productId}`)
                .set("Cookie", cookies);

            expect(response.status).to.equal(404);
            expect(response.text).to.include("Профіль або кошик користувача не знайдено");
        });
    })
    describe("DELETE /shop/admin/product/delete/:productId", () => {
        it("Повинен видалити продукт із магазину та усі кошикі користувача", async () => {
            const category = await addTestCategory();
            const categoryId = category._id.toString();

            const product = await addTestProduct(categoryId);
            const productId = product._id.toString();

            const user = newUser;
            const userId = user._id.toString();

            const cart = new Cart({ user: userId, products: [{ productId }] });
            await cart.save();

            const response = await request(app)
                .delete(`/shop/admin/product/delete/${productId}`)
                .set("Cookie", cookies);

            expect(response.status).to.equal(302);
            expect(response.headers.location).to.equal("/shop/admin/panel");

            const updatedCart = await Cart.findById(cart._id);
            expect(updatedCart.products).to.have.lengthOf(0);

            const deletedProduct = await Product.findById(productId);
            expect(deletedProduct).to.be.null;
        });
    });
    describe("GET /shop/admin/product/edit/:productId", () => {
        it("Повинен відображати сторінку редагування продукту з правильними даними", async () => {
            const category = await addTestCategory();
            const categoryId = category._id.toString();

            const product = await addTestProduct(categoryId);
            const productId = product._id.toString();

            const user = newUser;
            const userId = user._id.toString();

            const response = await request(app)
                .get(`/shop/admin/product/edit/${productId}`)
                .set("Cookie", cookies);

            expect(response.status).to.equal(200);
            expect(response.text).to.include("Редагування продукту");
            expect(response.text).to.include(product.title);
            expect(response.text).to.include(product.description);
            expect(response.text).to.include(product.price.toString());
        });
        it("Повинен повертати 404, якщо продукт не знайдено", async () => {
            const invalidProductId = "123456789012345678901234";

            const response = await request(app)
                .get(`/shop/admin/product/edit/${invalidProductId}`)
                .set("Cookie", cookies);

            expect(response.status).to.equal(404);
            expect(response.text).to.include("Продукт не знайдено");
        });
    });
    describe("PUT /shop/admin/product/edit/:productId", () => {
        it("Повинен оновити продукт із новою категорією", async () => {
            const category = await addTestCategory();
            const categoryId = category._id.toString();

            const product = await addTestProduct(categoryId);
            const productId = product._id.toString();

            const newCategory = "Тест нова категорія";

            const response = await request(app)
                .put(`/shop/admin/product/edit/${productId}`)
                .set("Cookie", cookies)
                .send({
                    title: "Тест новий продукт",
                    description: "Тест опис продукту",
                    price: 200,
                    newCategory: newCategory,
                });

            expect(response.status).to.equal(302);

            const updatedProduct = await Product.findById(productId).populate("category");
            expect(updatedProduct.title).to.equal("Тест новий продукт");
            expect(updatedProduct.category.title).to.equal(newCategory);
        });
        it("Повинен оновити продукт із наявною категорією", async () => {
            const existingCategory = await addTestCategory();
            const categoryId = existingCategory._id.toString();

            const product = await addTestProduct(categoryId);
            const productId = product._id.toString();

            const response = await request(app)
                .put(`/shop/admin/product/edit/${productId}`)
                .set("Cookie", cookies)
                .send({
                    title: "Тест новий продукт",
                    description: "Тест опис продукту",
                    price: 200,
                    existingCategory: categoryId,
                });

            expect(response.status).to.equal(302);
            const updatedProduct = await Product.findById(productId);
            expect(updatedProduct.title).to.equal("Тест новий продукт");
            expect(updatedProduct.category._id.toString()).to.equal(categoryId);
        });
        it("Повинен оновити продукт без зміни категорії", async () => {
            const category = await addTestCategory();
            const categoryId = category._id.toString();

            const product = await addTestProduct(categoryId);
            const productId = product._id.toString();

            const response = await request(app)
                .put(`/shop/admin/product/edit/${productId}`)
                .set("Cookie", cookies)
                .send({
                    title: "Тест новий продукт",
                    description: "Тест опис продукту",
                    price: 200,
                    existingCategory: "",
                });

            expect(response.status).to.equal(302);

            const updatedProduct = await Product.findById(productId);

            expect(updatedProduct.title).to.equal("Тест новий продукт");
            expect(updatedProduct.category._id.toString()).to.equal(categoryId);
        });
        it("Повинен повернути 404, якщо категорія не знайдено", async () => {
            const invalidCategoryId = "123456789012345678901234";

            const product = await addTestProduct(invalidCategoryId);
            const productId = product._id.toString();

            const response = await request(app)
                .put(`/shop/admin/product/edit/${productId}`)
                .set("Cookie", cookies)
                .send({
                    title: "Тест новий продукт",
                    description: "Тест опис продукту",
                    price: 200,
                    existingCategory: invalidCategoryId,
                });

            expect(response.status).to.equal(404);
            expect(response.text).to.include("Вибрана категорія не знайдена");
        });
        it("Повинен повернути 404, якщо продукт не знайдено", async () => {
            const invalidProductId = "123456789012345678901234";

            const response = await request(app)
                .put(`/shop/admin/product/edit/${invalidProductId}`)
                .set("Cookie", cookies)
                .send({
                    title: "Тест новий продукт",
                    description: "Тест опис продукту",
                    price: 200,
                });

            expect(response.status).to.equal(404);
            expect(response.text).to.include("Продукт не знайдено");
        });
        it("Повинен повернути 409, якщо нова категорія створена з такою назвою яка вже існує", async () => {
            const сategory = await addTestCategory();
            const categoryId = сategory._id.toString();

            const product = await addTestProduct(categoryId);
            const productId = product._id.toString();

            const response = await request(app)
                .put(`/shop/admin/product/edit/${productId}`)
                .set("Cookie", cookies)
                .send({
                    title: "Тест новий продукт",
                    description: "Тест опис продукту",
                    price: 200,
                    newCategory: сategory.title,
                });

            expect(response.status).to.equal(409);
            expect(response.text).to.include("Така категорія вже існує");
        });
    });
})