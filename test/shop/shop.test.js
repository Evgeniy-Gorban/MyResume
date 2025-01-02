const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../index");
const { MongoMemoryServer } = require("mongodb-memory-server");
const chai = require("chai");
const expect = chai.expect;
const cheerio = require('cheerio');
const path = require("path");
require('dotenv').config({ path: '.env.test' });
const User = require("../../models/Auth/User");
const Product = require("../../models/Shop/Product");
const Category = require("../../models/Shop/Category");
const Profile = require("../../models/Shop/Profile");
const Cart = require("../../models/Shop/Cart");
const { dontImage } = require('../../utils/dontImg');


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
const addTestProduct = async (category) => {
    const product = new Product({
        title: "Тест продукт",
        description: "Тест опис продукта",
        price: 1000,
        img: "/uploads/dontImg.jpeg",
        category: category._id
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

describe("Тест магазину", () => {
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

        await registerTestUser("testuser", "testpassword")
        const loginTest = await loginTestUser("testuser", "testpassword")
        cookies = loginTest.headers['set-cookie']
        user = await User.findOne({ username: "testuser" })

        await registerTestUser("newtestuser", "newtestpassword")
        const newUserLogin = await loginTestUser("newtestuser", "newtestpassword")
        newCookies = newUserLogin.headers['set-cookie']
        newUser = await User.findOne({ username: "newtestuser" })
    });

    beforeEach(async () => {
        await Category.deleteMany();
        await Product.deleteMany();
        await Profile.deleteMany();
    });

    after(async () => {
        server.close();
        await mongoose.disconnect();
        if (mongoServer) {
            await mongoServer.stop();
        }
    });

    describe("GET /shop", () => {
        it("Повинен повернути сторінку магазину з продуктами та категоріями", async () => {
            const category = await addTestCategory()
            await addTestProduct(category)

            const response = await request(app)
                .get("/shop");

            expect(response.status).to.equal(200);
            expect(response.text).to.include("Тест категорія");
            expect(response.text).to.include("Тест продукт");
        });
        it("Повинен коректно обробляти пагінацію", async () => {
            const category = await addTestCategory()

            for (let i = 0; i < 10; i++) {
                await addTestProduct(category);
            }

            const responsePage1 = await request(app)
                .get("/shop?page=1");
            expect(responsePage1.status).to.equal(200);

            const $page1 = cheerio.load(responsePage1.text);
            const productsOnPage1 = $page1('.product-item').length;

            expect(productsOnPage1).to.equal(6);


            const responsePage2 = await request(app)
                .get("/shop?page=2");
            expect(responsePage2.status).to.equal(200);

            const $page2 = cheerio.load(responsePage2.text);
            const productsOnPage2 = $page2('.product-item').length;

            expect(productsOnPage2).to.equal(4);
        });
    });
    describe("GET /shop/profile/:username", () => {
        it("Повинен повернути профіль користувача", async () => {
            const userName = user.username

            const response = await request(app)
                .get(`/shop/profile/${userName}`)
                .set("Cookie", cookies);

            expect(response.status).to.equal(200);
            expect(response.text).to.include("Ласкаво просимо");
            expect(response.text).to.include("Ваш кошик");
        });
        it("Повинен створити профіль із кошиком, якщо профіль не існує", async () => {
            const userName = user.username;
            const category = await addTestCategory();
            const product = await addTestProduct(category);

            let profile = await Profile.findOne({ user: user._id });
            expect(profile).to.be.null;

            const response = await request(app)
                .post("/shop/product/add")
                .send({ productId: product._id, quantity: 2 })
                .set("Cookie", cookies);

            expect(response.status).to.equal(302);

            profile = await Profile.findOne({ user: user._id });
            expect(profile).to.exist;
            expect(profile.img).to.equal(dontImage());

            const cart = await Cart.findById(profile.cart);
            expect(cart).to.exist;
            expect(cart.products).to.have.lengthOf(1);
            expect(cart.products[0].productId.toString()).to.equal(product._id.toString());

            const profileResponse = await request(app)
                .get(`/shop/profile/${userName}`)
                .set("Cookie", cookies);

            expect(profileResponse.status).to.equal(200);
            expect(profileResponse.text).to.include(userName);
            expect(profileResponse.text).to.include("Тест продукт");
            expect(profileResponse.text).to.include("2");

            expect(profileResponse.text).to.include(dontImage());
        });
        it("Повинен повернути 403, якщо користувач намагається зайти під інший профіль", async () => {
            const newUserName = newUser.username

            const response = await request(app)
                .get(`/shop/profile/${newUserName}`)
                .set("Cookie", cookies);

            expect(response.status).to.equal(403);
            expect(response.text).to.include("У вас немає прав для доступу до цього профілю");
        });
        it("Повинен повернути 404, якщо користувач не знайдено", async () => {
            const response = await request(app)
                .get("/shop/profile/dontUser")
                .set("Cookie", cookies);

            expect(response.status).to.equal(404);
            expect(response.text).to.include("Користувач не знайдено");
        });
    });
    describe("POST /shop/profile/upload/:username", () => {
        it("Повинен успішно завантажити зображення профілю", async () => {
            const username = user.username;
            const category = await addTestCategory();
            const product = await addTestProduct(category);

            const addProductResponse = await request(app)
                .post(`/shop/product/add`)
                .send({ productId: product._id, quantity: 2 })
                .set("Cookie", cookies);

            expect(addProductResponse.status).to.equal(302);

            const uploadImageProfileResponse = await request(app)
                .post(`/shop/profile/upload/${username}`)
                .set("Cookie", cookies)
                .attach("profilePhoto", path.resolve(__dirname, "../../test/test-image.jpg"));

            expect(uploadImageProfileResponse.status).to.equal(302);

            const profile = await Profile.findOne({ user: user._id });
            expect(profile).to.exist;
            expect(profile.img).to.include("uploads/profiles");
        });
        it("Повинен повернути 404, якщо користувач не знайдено", async () => {
            const response = await request(app)
                .post("/shop/profile/upload/dontUser")
                .set("Cookie", cookies)
                .attach("profilePhoto", path.resolve(__dirname, "../../test/test-image.jpg"));

            expect(response.status).to.equal(404);
            expect(response.text).to.include("Користувач не знайдено");
        });
    });
    describe("POST /shop/product/add", () => {
        it("Повинен додати продукт до кошика", async () => {
            const userName = user.username;
            const category = await addTestCategory();
            const product = await addTestProduct(category);

            const response = await request(app)
                .post("/shop/product/add")
                .send({ productId: product._id, quantity: 1 })
                .set("Cookie", cookies);

            expect(response.status).to.equal(302);

            const profileResponse = await request(app)
                .get(`/shop/profile/${userName}`)
                .set("Cookie", cookies);

            expect(profileResponse.status).to.equal(200);
            expect(profileResponse.text).to.include(userName);
            expect(profileResponse.text).to.include("Тест продукт");
            expect(profileResponse.text).to.include("1");
        });
        it("Повинний створити профіль та кошик, якщо профіль або кошик не знайдено", async () => {
            const userName = user.username;
            const category = await addTestCategory();
            const product = await addTestProduct(category);

            let profile = await Profile.findOne({ user: user._id });
            expect(profile).to.be.null;

            const response = await request(app)
                .post("/shop/product/add")
                .send({ productId: product._id, quantity: 2 })
                .set("Cookie", cookies);

            expect(response.status).to.equal(302);

            profile = await Profile.findOne({ user: user._id });
            expect(profile).to.exist;
            expect(profile.img).to.equal(dontImage());

            const cart = await Cart.findById(profile.cart);
            expect(cart).to.exist;
            expect(cart.products).to.have.lengthOf(1);
            expect(cart.products[0].productId.toString()).to.equal(product._id.toString());

            const profileResponse = await request(app)
                .get(`/shop/profile/${userName}`)
                .set("Cookie", cookies);

            expect(profileResponse.status).to.equal(200);
            expect(profileResponse.text).to.include(userName);
            expect(profileResponse.text).to.include("Тест продукт");
            expect(profileResponse.text).to.include("2");

            expect(profileResponse.text).to.include(dontImage());
        });
        it("Повинен додати другий продукт до кошика, якщо у кошику вже є один продукт", async () => {
            const category = await addTestCategory();

            const firstProduct = await addTestProduct(category);

            const responseFirstProduct = await request(app)
                .post("/shop/product/add")
                .send({ productId: firstProduct._id, quantity: 1 })
                .set("Cookie", cookies);

            expect(responseFirstProduct.status).to.equal(302);

            let profile = await Profile.findOne({ user: user._id }).populate("cart");
            expect(profile.cart.products).to.have.lengthOf(1);
            expect(profile.cart.products[0].productId.toString()).to.equal(firstProduct._id.toString());

            const secondProduct = await addTestProduct(category);

            const responseSecondProduct = await request(app)
                .post("/shop/product/add")
                .send({ productId: secondProduct._id, quantity: 1 })
                .set("Cookie", cookies);

            expect(responseSecondProduct.status).to.equal(302);

            profile = await Profile.findOne({ user: user._id }).populate("cart");

            expect(profile.cart.products).to.have.lengthOf(2);
            expect(profile.cart.products[1].productId.toString()).to.equal(secondProduct._id.toString());
        });
        it("Повинен повернути 404, якщо продукт не знайдено", async () => {
            const invalidProductId = "123456789012345678901234"

            const response = await request(app)
                .post("/shop/product/add")
                .send({ productId: invalidProductId })
                .set("Cookie", cookies);

            expect(response.status).to.equal(404);
            expect(response.text).to.include("Продукт не знайдено");
        });
    });
    describe("PUT /shop/product/update", () => {
        it("Повинен збільшити кількість товару в кошику", async () => {
            const category = await addTestCategory();
            const product = await addTestProduct(category);

            for (let i = 0; i < 5; i++) {
                await request(app)
                    .post("/shop/product/add")
                    .send({ productId: product._id })
                    .set("Cookie", cookies);
            }

            const response = await request(app)
                .put("/shop/product/update")
                .send({ productId: product._id, action: "increase" })
                .set("Cookie", cookies);

            const profile = await Profile.findOne({ user: user._id }).populate("cart");
            const cartProduct = profile.cart.products.find(
                (item) => item.productId.toString() === product._id.toString()
            );

            expect(response.status).to.equal(302);
            expect(cartProduct.quantity).to.equal(6);
        });
        it("Повинен зменшити кількість товару у кошику", async () => {
            const category = await addTestCategory();
            const product = await addTestProduct(category);

            for (let i = 0; i < 5; i++) {
                await request(app)
                    .post("/shop/product/add")
                    .send({ productId: product._id })
                    .set("Cookie", cookies);
            }

            const response = await request(app)
                .put("/shop/product/update")
                .send({ productId: product._id, action: "decrease" })
                .set("Cookie", cookies);

            const profile = await Profile.findOne({ user: user._id }).populate("cart");
            const cartProduct = profile.cart.products.find(
                (item) => item.productId.toString() === product._id.toString()
            );

            expect(response.status).to.equal(302);
            expect(cartProduct.quantity).to.equal(4);
        });
        it("Повинен видалити продукт з кошика, якщо кількість дорівнює нулю", async () => {
            const category = await addTestCategory();
            const product = await addTestProduct(category);

            await request(app)
                .post("/shop/product/add")
                .send({ productId: product._id })
                .set("Cookie", cookies);

            const response = await request(app)
                .put("/shop/product/update")
                .send({ productId: product._id, action: "decrease" })
                .set("Cookie", cookies);

            const profile = await Profile.findOne({ user: user._id }).populate("cart");
            const cartProduct = profile.cart.products.find(
                (item) => item.productId.toString() === product._id.toString()
            );

            expect(response.status).to.equal(302);
            expect(cartProduct).to.be.undefined;
        });
        it("Повинен повернути 404, якщо продукт не знайдений у кошику", async () => {
            const invalidProductId = "123456789012345678901234";

            const category = await addTestCategory();
            const product = await addTestProduct(category);

            await request(app)
                .post("/shop/product/add")
                .send({ productId: product._id })
                .set("Cookie", cookies);

            const response = await request(app)
                .put("/shop/product/update")
                .send({ productId: invalidProductId, action: "decrease" })
                .set("Cookie", cookies);

            expect(response.status).to.equal(404);
            expect(response.text).to.include('Продукт у кошику не знайдено');
        });
        it("Повинен повернути 404, якщо кошик не знайдено", async () => {
            const category = await addTestCategory();
            const product = await addTestProduct(category);

            await Profile.updateOne({ user: user._id }, { cart: null });

            const response = await request(app)
                .put("/shop/product/update")
                .send({ productId: product._id, action: "increase" })
                .set("Cookie", cookies);

            expect(response.status).to.equal(404);
            expect(response.text).to.include("Кошик не знайдено");
        });
    });
    describe("DELETE /shop/product/delete", () => {
        it("Повинен видалити продукт із кошика", async () => {
            const category = await addTestCategory();
            const product = await addTestProduct(category);

            await request(app)
                .post("/shop/product/add")
                .send({ productId: product._id })
                .set("Cookie", cookies);

            const response = await request(app)
                .delete("/shop/product/delete")
                .send({ productId: product._id })
                .set("Cookie", cookies);

            expect(response.status).to.equal(302);

            const profile = await Profile.findOne({ user: user._id }).populate("cart");
            const cartProduct = profile.cart.products.find(
                (item) => item.productId.toString() === product._id.toString()
            );
            expect(cartProduct).to.be.undefined;
        });
        it("Повинен повернути 404, якщо кошик не знайдено", async () => {
            await Profile.findOneAndUpdate({ user: user._id }, { cart: null });

            const invalidProductId = "123456789012345678901234";

            const response = await request(app)
                .delete("/shop/product/delete")
                .send({ productId: invalidProductId })
                .set("Cookie", cookies);

            expect(response.status).to.equal(404);
            expect(response.text).to.include("Кошик не знайдено");
        });
        it("Повинен повернути 404, якщо користувач не знайдено", async () => {
            await User.findByIdAndDelete(user._id);

            const invalidProductId = "123456789012345678901234";

            const response = await request(app)
                .delete("/shop/product/delete")
                .send({ productId: invalidProductId })
                .set("Cookie", cookies);

            expect(response.status).to.equal(404);
            expect(response.text).to.include("Користувач не знайдено");
        });
    })
    describe("GET /shop/placing-order", () => {
        it("Повинен повернути сторінку із системою оплати продуктів", async () => {
            const response = await request(app)
                .get("/shop/placing-order")
                .set("Cookie", cookies)

            expect(response.status).to.equal(200);
            expect(response.text).to.include("Тут виконується оплата вашого замовлення");
        });
    })
})